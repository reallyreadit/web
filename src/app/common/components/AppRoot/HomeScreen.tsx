import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import { updateCommunityReads } from '../controls/articles/CommunityReadsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { Screen, SharedState, NavReference, NavOptions } from '../Root';
import AsyncLink from '../controls/AsyncLink';
import produce from 'immer';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import Alert from '../../../../common/models/notifications/Alert';
import UpdateBanner from '../../../../common/components/UpdateBanner';
import Rating from '../../../../common/models/Rating';
import CommunityReadsQuery from '../../../../common/models/articles/CommunityReadsQuery';
import { Sort } from '../controls/articles/AotdView';
import {DeviceType} from '../../../../common/DeviceType';
import { ShareChannelData } from '../../../../common/sharing/ShareData';
import {SubscriptionStatus, SubscriptionStatusType} from '../../../../common/models/subscriptions/SubscriptionStatus';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import ArticleQuery from '../../../../common/models/articles/ArticleQuery';
import PageResult from '../../../../common/models/PageResult';
import List from '../controls/List';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import Button from '../../../../common/components/Button';
import ScreenKey from '../../../../common/routing/ScreenKey';
import {LeaderboardsViewParams} from '../screens/LeaderboardsScreen';
import MorphingArticleDetails from '../../../../common/components/MorphingArticleDetails';
import Icon from '../../../../common/components/Icon';
import FreeTrialNotice from './FreeTrialNotice';

interface Props {
	deviceType: DeviceType,
	onClearAlerts: (alert: Alert) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetAotdHistory: FetchFunctionWithParams<ArticleQuery, PageResult<UserArticle>>,
	onGetCommunityReads: FetchFunctionWithParams<CommunityReadsQuery, CommunityReads>,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onOpenSubscriptionPromptDialog: (article?: UserArticle, provider?: SubscriptionProvider) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null,
	subscriptionStatus: SubscriptionStatus
}
interface State {
	aotdHistory: Fetchable<PageResult<UserArticle>>,
	// only intended for fetching the AOTD
	communityReads: Fetchable<CommunityReads>,
	isLoadingNewItems: boolean,
	maxLength?: number,
	minLength?: number,
	newAotd: boolean,
	sort: Sort
}
class HomeScreen extends React.Component<Props, State> {
	private static readonly COMMUNITY_READS_PAGE_SIZE = 1;
	private readonly _asyncTracker = new AsyncTracker();
	private _hasClearedAlert = false;
	private readonly _loadMore = () => {
		this.setState({
			isLoadingNewItems: false,
			newAotd: false
		});
		return new Promise<void>(
			resolve => {
				const newPageNumber = this.state.aotdHistory.value.pageNumber + 1;
				this.props.onGetAotdHistory(
					{
						pageNumber: newPageNumber,
						minLength: null,
						maxLength: null
					},
					this._asyncTracker.addCallback(
						aotdHistory => {
							resolve();
							this.setState(
								produce(
									(state: State) => {
										state.aotdHistory.value.pageNumber = newPageNumber;
										state.aotdHistory.value.items = [
											...state.aotdHistory.value.items,
											...aotdHistory.value.items
										 ];
									}
								)
							);
						}
					)
				);
			}
		);
	};
	private readonly _loadNewItems = () => {
		this.setState({
			isLoadingNewItems: true
		});
		this.fetchNewAOTD(null, null, 1, this.state.sort);

	};
	constructor(props: Props) {
		super(props);
		const sort = CommunityReadSort.Hot;
		this.state = {
			aotdHistory: props.onGetAotdHistory(
				{
					maxLength: null,
					minLength: null,
					pageNumber: 1
				},
				this._asyncTracker.addCallback(
					aotdHistory => {
						this.setState({
							aotdHistory,
						});
					}
				)
			),
			communityReads: props.onGetCommunityReads(
				{
					maxLength: null,
					minLength: null,
					pageNumber: 1,
					// we only need the aotd, not paginated contenders here
					pageSize: HomeScreen.COMMUNITY_READS_PAGE_SIZE,
					sort
				},
				this._asyncTracker.addCallback(
					communityReads => {
						this.setState({
							communityReads
						});
						this.clearAlertIfNeeded();
					}
				)
			),
			isLoadingNewItems: false,
			newAotd: false,
			sort
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				// updates the AOTD (and more, but only the AOTD is relevant here)
				updateCommunityReads.call(this, event.article, event.isCompletionCommit);
				// updates the previous AOTD winners if needed
				if (
					this.state.aotdHistory.value &&
					this.state.aotdHistory.value.items.some(article => article.id === event.article.id)
				) {
					this.setState(produce((prevState: State) => {
						prevState.aotdHistory.value.items.forEach((article, index, articles) => {
							if (article.id === event.article.id) {
								// merge objects in case the new object is missing properties due to outdated iOS client
								articles.splice(
									articles.indexOf(article),
									1,
									{
										...article,
										...event.article,
										dateStarred: event.article.dateStarred
									}
								);
							}
						});
					}));
				}
			})
		);
	}
	private clearAlertIfNeeded() {
		if (!this._hasClearedAlert && hasAnyAlerts(this.props.user, Alert.Aotd)) {
			this.props.onClearAlerts(Alert.Aotd);
			this._hasClearedAlert = true;
		}
	}
	// note: this assumes that only 1 day has passed since the new AOTD arrived (there is only 1 new AOTD)
	private fetchNewAOTD(minLength: number | null, maxLength: number | null, pageNumber: number, sort: Sort) {
		const communityPromise = new Promise<Fetchable<CommunityReads>>((resolve, reject) => {
			try {
				this.props.onGetCommunityReads(
					{
						maxLength,
						minLength,
						pageNumber,
						pageSize: HomeScreen.COMMUNITY_READS_PAGE_SIZE,
						sort
					},
					resolve
				);
			} catch (e) {
				reject(e);
			}
		});

		communityPromise.then( (communityReads) => {
			this.setState(produce((prevState: State) => {
				// add the OLD aotd to the top of the AOTD history locally
				if (!prevState.aotdHistory.isLoading && this.state.aotdHistory.value) {
					prevState.aotdHistory.value.items = [
						prevState.communityReads.value.aotd,
						...prevState.aotdHistory.value.items
					];
				}
				// merge in the new AOTD
				prevState.communityReads = communityReads;
				// set loading state
				return {
					...prevState,
					isLoadingNewItems: false,
					newAotd: false
				}
			}));
			this.clearAlertIfNeeded();
		})
	}

	public componentDidMount() {
		if (!this.state.communityReads.isLoading) {
			this.clearAlertIfNeeded();
		}
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			this.props.user &&
			this.props.user.aotdAlert &&
			prevProps.user &&
			!prevProps.user.aotdAlert
		) {
			this.setState({
				newAotd: true
			});
			this._hasClearedAlert = false;
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="home-screen_an7vm5">
				{/* NOTE: this will only show content once both the AOTD and previous winners are loaded */}
				{(
					this.isLoading()
				) ?
					<LoadingOverlay position="static" /> :
					<>
						{/* TODO: this has not been tested yet */}
						{this.state.newAotd ?
							<UpdateBanner
								isBusy={this.state.isLoadingNewItems}
								onClick={this._loadNewItems}
								text="Show new Article of the Day"
							/> :
						null}
						{(
							!(this.props.subscriptionStatus.isUserFreeForLife) &&
							this.props.subscriptionStatus.type === SubscriptionStatusType.NeverSubscribed
						)
							?
							<FreeTrialNotice
								onNavTo={this.props.onNavTo}
								onOpenSubscriptionPromptDialog={this.props.onOpenSubscriptionPromptDialog}
								subscriptionStatus={this.props.subscriptionStatus}
							/> :
						null}
						<h2 className="section-header">
							<Icon name="trophy"/> Article of the Day
						</h2>
						<MorphingArticleDetails
							article={this.state.communityReads.value.aotd}
							className="aotd--desktop-display"
							deviceType={this.props.deviceType}
							highlight={this.state.communityReads.value.aotdHasAlert}
							isFeatured={true}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onNavTo={this.props.onNavTo}
							onPost={this.props.onPostArticle}
							onRateArticle={this.props.onRateArticle}
							onRead={this.props.onReadArticle}
							onShare={this.props.onShare}
							onShareViaChannel={this.props.onShareViaChannel}
							onToggleStar={this.props.onToggleArticleStar}
							onViewComments={this.props.onViewComments}
							onViewProfile={this.props.onViewProfile}
							user={this.props.user}
							showImage={true}
							showDescription={true}
							showScout={false}
							showAotdMetadata={false}
							topline={null}
						/>
						<h2 className="section-header">
							<Icon name="trophy"/> Yesterday's Article of the Day
						</h2>
						<MorphingArticleDetails
							article={this.state.aotdHistory.value.items[0]}
							className="aotd--desktop-display"
							deviceType={this.props.deviceType}
							highlight={this.state.communityReads.value.aotdHasAlert}
							isFeatured={true}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onNavTo={this.props.onNavTo}
							onPost={this.props.onPostArticle}
							onRateArticle={this.props.onRateArticle}
							onRead={this.props.onReadArticle}
							onShare={this.props.onShare}
							onShareViaChannel={this.props.onShareViaChannel}
							onToggleStar={this.props.onToggleArticleStar}
							onViewComments={this.props.onViewComments}
							onViewProfile={this.props.onViewProfile}
							user={this.props.user}
							showImage={true}
							showDescription={true}
							showScout={false}
							showAotdMetadata={false}
							topline={null}
						/>
						<h2 className="section-header">
							<Icon name="internet" /> Discover
						</h2>
						<div className="controls">
							<Button
								iconRight="chevron-right"
								intent="normal"
								onClick={(_) => this.props.onNavTo({key: ScreenKey.BestEver})}
								text="Top articles of all time"
							/>
							<Button
								iconRight="chevron-right"
								intent="normal"
								onClick={(_) => this.props.onNavTo({
									key: ScreenKey.Leaderboards, params: {view: LeaderboardsViewParams.Readers}})}
								text="Community Leaderboards"
							/>
						</div>
						<h2 className="section-header">
							<Icon name="history-simple"/> Previous Winners
						</h2>
						<List>
							{this.state.aotdHistory.value.items.slice(1).map(
								(article, index) => (
									<li key={article.id}>
										<ArticleDetails
											article={article}
											deviceType={this.props.deviceType}
											onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
											onNavTo={this.props.onNavTo}
											onPost={this.props.onPostArticle}
											onRateArticle={this.props.onRateArticle}
											onRead={this.props.onReadArticle}
											onShare={this.props.onShare}
											onShareViaChannel={this.props.onShareViaChannel}
											onToggleStar={this.props.onToggleArticleStar}
											onViewComments={this.props.onViewComments}
											onViewProfile={this.props.onViewProfile}
											showAotdMetadata={true}
											showDescription={true}
											showScout={false}
											showImage={true}
											user={this.props.user}
										/>
									</li>
								)
							)}
						</List>
						{!this.isLoading() ?
							<div className="show-more">
								<AsyncLink
									text="Show more"
									onClick={this._loadMore}
								/>
							</div> :
							null}
					</>}
			</ScreenContainer>
		);
	}

	private isLoading() {
		return this.state.communityReads.isLoading || this.state.aotdHistory.isLoading;
	}
}
export default function <TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user' | 'subscriptionStatus'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'AOTD'
		}),
		render: (screenState: Screen, sharedState: SharedState) => (
			<HomeScreen {
				...{
					...deps,
					user: sharedState.user,
					subscriptionStatus: sharedState.subscriptionStatus
				}
			} />
		)
	};
}