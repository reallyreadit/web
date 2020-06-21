import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount, { hasAlert } from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadsList, { updateCommunityReads } from '../controls/articles/CommunityReadsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { Screen, SharedState } from '../Root';
import AsyncActionLink from '../controls/AsyncActionLink';
import produce from 'immer';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import ShareData from '../../../../common/sharing/ShareData';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import Alert from '../../../../common/models/notifications/Alert';
import UpdateBanner from '../../../../common/components/UpdateBanner';
import Rating from '../../../../common/models/Rating';
import CommunityReadsQuery from '../../../../common/models/articles/CommunityReadsQuery';
import StickyNote from '../../../../common/components/StickyNote';
import { Sort } from '../controls/articles/AotdView';

interface Props {
	onClearAlerts: (alert: Alert) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<CommunityReadsQuery, CommunityReads>,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareResponse,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
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
	private readonly _changeLengthRange = (minLength: number | null, maxLength: number | null) => {
		this.setState({
			isLoading: true,
			maxLength,
			minLength,
			newAotd: false
		});
		this.fetchItems(minLength, maxLength, 1, this.state.sort);
	};
	private readonly _changeSort = (sort: Sort) => {
		this.setState({
			isLoading: true,
			newAotd: false,
			sort
		});
		this.fetchItems(this.state.minLength, this.state.maxLength, 1, sort);
	};
	private _hasClearedAlert = false;
	private readonly _loadMore = () => {
		this.setState({
			isLoadingNewItems: false,
			newAotd: false
		});
		return this._asyncTracker.addPromise(
			new Promise<void>(
				resolve => {
					this.props.onGetCommunityReads(
						{
							pageNumber: this.state.communityReads.value.articles.pageNumber + 1,
							pageSize: 10,
							sort: this.state.sort,
							minLength: this.state.minLength,
							maxLength: this.state.maxLength
						},
						this._asyncTracker.addCallback(
							communityReads => {
								resolve();
								this.setState(
									produce(
										(state: State) => {
											state.communityReads.value.articles = {
												...communityReads.value.articles,
												items: state.communityReads.value.articles.items.concat(
													communityReads.value.articles.items
												)
											}
										}
									)
								);
							}
						)
					);
				}
			)
		);
	};
	private readonly _loadNewItems = () => {
		this.setState({
			isLoadingNewItems: true
		});
		this.fetchItems(null, null, 1, this.state.sort);
	};
	constructor(props: Props) {
		super(props);
		const sort = CommunityReadSort.Hot;
		this.state = {
			communityReads: props.onGetCommunityReads(
				{
					maxLength: null,
					minLength: null,
					pageNumber: 1,
					pageSize: 10,
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
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				updateCommunityReads.call(this, event.article, event.isCompletionCommit);
			})
		);
	}
	private clearAlertIfNeeded() {
		if (!this._hasClearedAlert && hasAlert(this.props.user, Alert.Aotd)) {
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
				pageSize: 10,
				sort
			},
			this._asyncTracker.addCallback(
				communityReads => {
					this.setState({
						communityReads,
						isLoading: false,
						isLoadingNewItems: false,
						newAotd: false,
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
		return (
			<ScreenContainer className="home-screen_an7vm5">
				{this.state.communityReads.isLoading ?
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
							aotd={this.state.communityReads.value.aotd}
							aotdHasAlert={this.state.communityReads.value.aotdHasAlert}
							articles={this.state.communityReads.value.articles}
							isLoading={this.state.isLoading}
							maxLength={this.state.maxLength}
							minLength={this.state.minLength}
							onChangeLengthRange={this._changeLengthRange}
							onChangeSort={this._changeSort}
							onCopyTextToClipboard={this.props.onCopyTextToClipboard}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onRateArticle={this.props.onRateArticle}
							onPostArticle={this.props.onPostArticle}
							onReadArticle={this.props.onReadArticle}
							onShare={this.props.onShare}
							onToggleArticleStar={this.props.onToggleArticleStar}
							onViewAotdHistory={this.props.onViewAotdHistory}
							onViewComments={this.props.onViewComments}
							onViewProfile={this.props.onViewProfile}
							sort={this.state.sort}
							user={this.props.user}
						/>
						{!this.state.isLoading ?
							<div className="show-more">
								<AsyncActionLink
									text="Show more"
									onClick={this._loadMore}
								/>
							</div> :
							null}
					</>}
			</ScreenContainer>
		);
	}
}
export default function <TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Article of the Day'
		}),
		render: (screenState: Screen, sharedState: SharedState) => (
			<HomeScreen {
				...{
					...deps,
					user: sharedState.user
				}
			} />
		)
	};
}