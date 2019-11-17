import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount, { hasAlert } from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadsList, { updateCommunityReads, View } from '../controls/articles/CommunityReadsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { Screen, SharedState } from '../Root';
import AsyncActionLink from '../controls/AsyncActionLink';
import produce from 'immer';
import WelcomeInfoBox from '../WelcomeInfoBox';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import CommunityReadTimeWindow from '../../../../common/models/CommunityReadTimeWindow';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import CommentThread from '../../../../common/models/CommentThread';
import FolloweesPostsQuery from '../../../../common/models/social/FolloweesPostsQuery';
import PageResult from '../../../../common/models/PageResult';
import Post from '../../../../common/models/social/Post';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Alert from '../../../../common/models/notifications/Alert';
import { formatCountable } from '../../../../common/format';
import UpdateBanner from '../../../../common/components/UpdateBanner';
import Rating from '../../../../common/models/Rating';

interface Props {
	onClearAlerts: (alert: Alert) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow, minLength?: number, maxLength?: number }, CommunityReads>,
	onGetFolloweesPosts: FetchFunctionWithParams<FolloweesPostsQuery, PageResult<Post>>,
	onOpenMenu: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	screenId: number,
	user: UserAccount | null,
	view: View
}
interface State {
	communityReads?: Fetchable<CommunityReads>,
	isLoading: boolean,
	isLoadingNewItems: boolean,
	maxLength?: number,
	minLength?: number,
	newItemMessage: string | null,
	posts?: Fetchable<PageResult<Post>>,
	sort: CommunityReadSort,
	timeWindow?: CommunityReadTimeWindow
}
class HomeScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeParams = (view: View, sort: CommunityReadSort, timeWindow: CommunityReadTimeWindow | null, minLength: number | null, maxLength: number | null) => {
		this.setState({
			isLoading: true,
			newItemMessage: null,
			sort, timeWindow, minLength, maxLength
		});
		this.props.onSetScreenState(
			this.props.screenId,
			() => ({
				location: {
					path: view === View.Trending ?
						'/' :
						'/following'
				}
			})
		);
		this.fetchItems(view, sort, timeWindow, minLength, maxLength, 1);
	};
	private _hasClearedAotdAlert = false;
	private _hasClearedFollowingAlert = false;
	private readonly _loadMore = () => {
		this.setState({
			isLoadingNewItems: false,
			newItemMessage: null
		});
		return this._asyncTracker.addPromise(
			new Promise<void>((resolve, reject) => {
				switch (this.props.view) {
					case View.Trending:
						this.props.onGetCommunityReads(
							{
								pageNumber: this.state.communityReads.value.articles.pageNumber + 1,
								pageSize: 10,
								sort: this.state.sort,
								timeWindow: this.state.timeWindow,
								minLength: this.state.minLength,
								maxLength: this.state.maxLength
							},
							this._asyncTracker.addCallback(
								communityReads => {
									resolve();
									this.setState(
										produce<State>(
											state => {
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
						break;
					case View.Following:
						this.props.onGetFolloweesPosts(
							{
								pageNumber: this.state.posts.value.pageNumber + 1,
								minLength: this.state.minLength,
								maxLength: this.state.maxLength
							},
							this._asyncTracker.addCallback(
								posts => {
									resolve();
									this.setState(
										produce<State>(
											state => {
												state.posts.value = {
													...posts.value,
													items: state.posts.value.items.concat(
														posts.value.items
													)
												};
											}
										)
									);
								}
							)
						)
						break;
				}
			})
		);
	};
	private readonly _loadNewItems = () => {
		this.setState({ isLoadingNewItems: true });
		this.fetchItems(this.props.view, CommunityReadSort.Hot, null, null, null, 1);
	};
	constructor(props: Props) {
		super(props);
		switch (props.view) {
			case View.Trending:
				this.state = {
					communityReads: props.onGetCommunityReads(
						{
							pageNumber: 1,
							pageSize: 10,
							sort: CommunityReadSort.Hot
						},
						this._asyncTracker.addCallback(
							communityReads => {
								this.setState({ communityReads });
								this.clearAotdAlertIfNeeded();
							}
						)
					),
					isLoading: false,
					isLoadingNewItems: false,
					newItemMessage: null,
					sort: CommunityReadSort.Hot
				};
				break;
			case View.Following:
				this.state = {
					posts: props.onGetFolloweesPosts(
						{
							maxLength: null,
							minLength: null,
							pageNumber: 1
						},
						this._asyncTracker.addCallback(
							posts => {
								this.setState({ posts });
								this.clearFollowingAlertIfNeeded();
							}
						)
					),
					isLoading: false,
					isLoadingNewItems: false,
					newItemMessage: null,
					sort: CommunityReadSort.Hot
				};
				break;
		}
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				updateCommunityReads.call(this, event.article, event.isCompletionCommit);
			})
		);
	}
	private clearAotdAlertIfNeeded() {
		if (!this._hasClearedAotdAlert && hasAlert(this.props.user, Alert.Aotd)) {
			this.props.onClearAlerts(Alert.Aotd);
			this._hasClearedAotdAlert = true;
		}
	}
	private clearFollowingAlertIfNeeded() {
		if (!this._hasClearedFollowingAlert && hasAlert(this.props.user, Alert.Following)) {
			this.props.onClearAlerts(Alert.Following);
			this._hasClearedFollowingAlert = true;
		}
	}
	private fetchItems(view: View, sort: CommunityReadSort, timeWindow: CommunityReadTimeWindow | null, minLength: number | null, maxLength: number | null, pageNumber: number) {
		switch (view) {
			case View.Trending:
				this.props.onGetCommunityReads(
					{
						pageNumber: 1,
						pageSize: 10,
						sort,
						timeWindow,
						minLength,
						maxLength
					},
					this._asyncTracker.addCallback(
						communityReads => {
							this.setState({
								communityReads,
								isLoading: false,
								isLoadingNewItems: false,
								newItemMessage: null,
							});
							this.clearAotdAlertIfNeeded();
						}
					)
				);
				break;
			case View.Following:
				this.props.onGetFolloweesPosts(
					{
						pageNumber: 1,
						minLength,
						maxLength
					},
					this._asyncTracker.addCallback(
						posts => {
							this.setState({
								isLoading: false,
								isLoadingNewItems: false,
								newItemMessage: null,
								posts
							});
							this.clearFollowingAlertIfNeeded();
						}
					)
				);
				break;
		}
	}
	public componentDidMount() {
		if (this.state.communityReads && !this.state.communityReads.isLoading) {
			this.clearAotdAlertIfNeeded();
		}
		if (this.state.posts && !this.state.posts.isLoading) {
			this.clearFollowingAlertIfNeeded();
		}
	}
	public componentDidUpdate(prevProps: Props) {
		switch (this.props.view) {
			case View.Trending:
				if (
					this.props.user &&
					this.props.user.aotdAlert &&
					prevProps.user &&
					!prevProps.user.aotdAlert
				) {
					this.setState({ newItemMessage: 'Show new Article of the Day' });
					this._hasClearedAotdAlert = false;
				}
				break;
			case View.Following:
				if (this.props.user && prevProps.user) {
					const newItemCount = Math.max(0, this.props.user.postAlertCount - prevProps.user.postAlertCount);
					if (newItemCount) {
						this.setState({
							newItemMessage: `Show ${newItemCount} new ${formatCountable(newItemCount, 'post')}`
						});
						this._hasClearedFollowingAlert = false;
					}
				}
				break;
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="home-screen_an7vm5">
				{(
					(this.state.communityReads && this.state.communityReads.isLoading) ||
					(this.state.posts && this.state.posts.isLoading)
				) ?
					<LoadingOverlay position="static" /> :
					<>
						{(
							this.props.user &&
							!this.state.posts &&
							!this.state.communityReads.value.userReadCount
						) ?
							<WelcomeInfoBox /> :
							null}
						{this.state.newItemMessage ?
							<UpdateBanner
								isBusy={this.state.isLoadingNewItems}
								onClick={this._loadNewItems}
								text={this.state.newItemMessage}
							/> :
							null}
						<CommunityReadsList
							aotd={this.state.communityReads && this.state.communityReads.value.aotd}
							aotdHasAlert={this.state.communityReads && this.state.communityReads.value.aotdHasAlert}
							articles={this.state.communityReads && this.state.communityReads.value.articles}
							isLoading={this.state.isLoading}
							isPaginated={false}
							maxLength={this.state.maxLength}
							minLength={this.state.minLength}
							onCopyTextToClipboard={this.props.onCopyTextToClipboard}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onParamsChanged={this._changeParams}
							onRateArticle={this.props.onRateArticle}
							onPostArticle={this.props.onPostArticle}
							onReadArticle={this.props.onReadArticle}
							onShare={this.props.onShare}
							onToggleArticleStar={this.props.onToggleArticleStar}
							onViewAotdHistory={this.props.onViewAotdHistory}
							onViewComments={this.props.onViewComments}
							onViewProfile={this.props.onViewProfile}
							onViewThread={this.props.onViewThread}
							posts={this.state.posts && this.state.posts.value}
							sort={this.state.sort}
							timeWindow={this.state.timeWindow}
							user={this.props.user}
							view={this.props.view}
						/>
						{(
							!this.state.isLoading && (
								this.props.view === View.Trending ||
								this.state.posts.value.items.length
							)
						) ?
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
	deps: Pick<Props, Exclude<keyof Props, 'screenId' | 'user' | 'view'>>
) {
	const route = findRouteByKey(routes, ScreenKey.Home);
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Discover'
		}),
		render: (screenState: Screen, sharedState: SharedState) => {
			const pathParams = route.getPathParams(screenState.location.path);
			return (
				<HomeScreen {
					...{
						...deps,
						screenId: screenState.id,
						user: sharedState.user,
						view: pathParams['view'] === 'trending' ?
							View.Trending :
							View.Following
					}
				} />
			);
		}
	};
}