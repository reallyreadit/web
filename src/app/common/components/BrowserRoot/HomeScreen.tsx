import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadsList, { updateCommunityReads } from '../controls/articles/CommunityReadsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams, FetchFunction } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { Screen, NavReference, NavOptions } from '../Root';
import PageSelector from '../controls/PageSelector';
import { SharedState } from '../BrowserRoot';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import MarketingScreen from './MarketingScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ScreenContainer from '../ScreenContainer';
import PageResult from '../../../../common/models/PageResult';
import Alert from '../../../../common/models/notifications/Alert';
import UpdateBanner from '../../../../common/components/UpdateBanner';
import Rating from '../../../../common/models/Rating';
import PublisherArticleQuery from '../../../../common/models/articles/PublisherArticleQuery';
import CommunityReadsQuery from '../../../../common/models/articles/CommunityReadsQuery';
import StickyNote from '../../../../common/components/StickyNote';
import { DeviceType } from '../../../../common/DeviceType';
import { Sort } from '../controls/articles/AotdView';
import { RevenueReportResponse } from '../../../../common/models/subscriptions/RevenueReport';
import { ShareChannelData } from '../../../../common/sharing/ShareData';

interface Props {
	deviceType: DeviceType,
	location: RouteLocation,
	onBeginOnboarding: (analyticsAction: string) => void,
	onClearAlerts: (alert: Alert) => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateStaticContentUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<CommunityReadsQuery, CommunityReads>,
	onGetPublisherArticles: FetchFunctionWithParams<PublisherArticleQuery, PageResult<UserArticle>>,
	onGetUserCount: FetchFunction<{ userCount: number }>,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewAuthor: (slug: string, name: string) => void,
	onViewComments: (article: UserArticle) => void,
	onViewMission: () => void,
	onViewProfile: (userName: string) => void,
	revenueReport: Fetchable<RevenueReportResponse>,
	user: UserAccount | null
}
interface State {
	communityReads: Fetchable<CommunityReads>,
	isLoading: boolean,
	isLoadingNewItems: boolean,
	maxLength?: number,
	minLength?: number,
	newAotd: boolean,
	sort: Sort
}
class HomeScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePage = (pageNumber: number) => {
		this.setState({
			isLoading: true,
			isLoadingNewItems: false,
			newAotd: false
		});
		this.fetchItems(this.state.minLength, this.state.maxLength, pageNumber, this.state.sort);
	};
	private readonly _changeSort = (sort: Sort) => {
		this.setState({
			isLoading: true,
			newAotd: false,
			sort
		});
		this.fetchItems(this.state.minLength, this.state.maxLength, 1, sort);
	};
	private readonly _loadNewItems = () => {
		this.setState({
			isLoadingNewItems: true
		});
		this.fetchItems(null, null, 1, this.state.sort);
	};
	private _hasClearedAlert = false;
	constructor(props: Props) {
		super(props);
		const sort = CommunityReadSort.Hot;
		if (props.user) {
			this.state = {
				communityReads: props.onGetCommunityReads(
					{
						maxLength: null,
						minLength: null,
						pageNumber: 1,
						pageSize: 40,
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
				isLoading: false,
				isLoadingNewItems: false,
				newAotd: false,
				sort
			};
		} else {
			this.state = {
				communityReads: props.onGetCommunityReads(
					{
						maxLength: null,
						minLength: null,
						pageNumber: 1,
						pageSize: 5,
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
				isLoading: false,
				isLoadingNewItems: false,
				newAotd: false,
				sort
			};
		}
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				updateCommunityReads.call(this, event.article, event.isCompletionCommit);
			}),
			props.onRegisterUserChangeHandler((user: UserAccount | null) => {
				if (user) {
					this.setState({
						communityReads: props.onGetCommunityReads(
							{
								maxLength: null,
								minLength: null,
								pageNumber: 1,
								pageSize: 40,
								sort: CommunityReadSort.Hot
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
						isLoading: false,
						newAotd: false
					});
				} else {
					this.setState({
						communityReads: props.onGetCommunityReads(
							{
								maxLength: null,
								minLength: null,
								pageNumber: 1,
								pageSize: 5,
								sort: CommunityReadSort.Hot
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
						isLoading: false,
						maxLength: null,
						minLength: null,
						newAotd: false
					});
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
	private fetchItems(minLength: number | null, maxLength: number | null, pageNumber: number, sort: Sort) {
		this.props.onGetCommunityReads(
			{
				maxLength,
				minLength,
				pageNumber,
				pageSize: 40,
				sort
			},
			this._asyncTracker.addCallback(
				communityReads => {
					this.setState({
						communityReads,
						isLoading: false,
						isLoadingNewItems: false,
						newAotd: false
					});
					this.clearAlertIfNeeded();
				}
			)
		);
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
		if (this.props.user) {
			return (
				<ScreenContainer className="home-screen_1sjipy">
					{this.state.communityReads && this.state.communityReads.isLoading ?
						<LoadingOverlay position="static" /> :
						<>
							{this.state.newAotd ?
								<UpdateBanner
									isBusy={this.state.isLoadingNewItems}
									onClick={this._loadNewItems}
									text="Show new Article of the Day"
								/> :
								null}
							{!this.state.communityReads.value.userReadCount ?
								<StickyNote>
									<strong>Welcome to Readup.</strong>
									<span>It's time to start reading!</span>
								</StickyNote> :
								null}
							<CommunityReadsList
								aotd={this.state.communityReads && this.state.communityReads.value.aotd}
								aotdHasAlert={this.state.communityReads && this.state.communityReads.value.aotdHasAlert}
								articles={this.state.communityReads && this.state.communityReads.value.articles}
								deviceType={this.props.deviceType}
								isLoading={this.state.isLoading}
								maxLength={this.state.maxLength}
								minLength={this.state.minLength}
								onChangeSort={this._changeSort}
								onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
								onNavTo={this.props.onNavTo}
								onPostArticle={this.props.onPostArticle}
								onRateArticle={this.props.onRateArticle}
								onReadArticle={this.props.onReadArticle}
								onShare={this.props.onShare}
								onShareViaChannel={this.props.onShareViaChannel}
								onToggleArticleStar={this.props.onToggleArticleStar}
								onViewAotdHistory={this.props.onViewAotdHistory}
								onViewComments={this.props.onViewComments}
								onViewProfile={this.props.onViewProfile}
								sort={this.state.sort}
								user={this.props.user}
							/>
							{!this.state.isLoading ?
								<PageSelector
									pageNumber={this.state.communityReads.value.articles.pageNumber}
									pageCount={this.state.communityReads.value.articles.pageCount}
									onChange={this._changePage}
								/> :
								null}
						</>}
				</ScreenContainer>
			);
		}
		return (
			<MarketingScreen
				communityReads={this.state.communityReads}
				deviceType={this.props.deviceType}
				location={this.props.location}
				onBeginOnboarding={this.props.onBeginOnboarding}
				onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
				onGetPublisherArticles={this.props.onGetPublisherArticles}
				onGetUserCount={this.props.onGetUserCount}
				onNavTo={this.props.onNavTo}
				onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
				onPostArticle={this.props.onPostArticle}
				onRateArticle={this.props.onRateArticle}
				onReadArticle={this.props.onReadArticle}
				onShare={this.props.onShare}
				onShareViaChannel={this.props.onShareViaChannel}
				onToggleArticleStar={this.props.onToggleArticleStar}
				onViewAotdHistory={this.props.onViewAotdHistory}
				onViewAuthor={this.props.onViewAuthor}
				onViewComments={this.props.onViewComments}
				onViewMission={this.props.onViewMission}
				onViewProfile={this.props.onViewProfile}
				revenueReport={this.props.revenueReport}
				user={this.props.user}
			/>
		);
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'location' | 'isExtensionInstalled' | 'revenueReport' | 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => ({
			id,
			key,
			location,
			title: 'Readup: Social Reading'
		}),
		render: (screenState: Screen, sharedState: SharedState) => (
			<HomeScreen {
				...{
					...deps,
					...sharedState,
					location: screenState.location
				}
			} />
		)
	};
}