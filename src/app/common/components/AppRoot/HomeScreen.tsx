import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
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

interface Props {
	highlightedCommentId: string | null,
	highlightedPostId: string | null,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow, minLength?: number, maxLength?: number }, CommunityReads>,
	onGetFolloweesPosts: FetchFunctionWithParams<FolloweesPostsQuery, PageResult<Post>>,
	onOpenMenu: () => void,
	onPostArticle: (article: UserArticle) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
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
	maxLength?: number,
	minLength?: number,
	posts?: Fetchable<PageResult<Post>>,
	sort: CommunityReadSort,
	timeWindow?: CommunityReadTimeWindow
}
class HomeScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeParams = (view: View, sort: CommunityReadSort, timeWindow: CommunityReadTimeWindow | null, minLength: number | null, maxLength: number | null) => {
		this.setState({
			isLoading: true,
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
								isLoading: false
							});
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
								posts
							});
						}
					)
				);
				break;
		}
	};
	private readonly _loadMore = () => {
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
							}
						)
					),
					isLoading: false,
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
							}
						)
					),
					isLoading: false,
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
						<CommunityReadsList
							aotd={this.state.communityReads && this.state.communityReads.value.aotd}
							articles={this.state.communityReads && this.state.communityReads.value.articles}
							highlightedCommentId={this.props.highlightedCommentId}
							highlightedPostId={this.props.highlightedPostId}
							isLoading={this.state.isLoading}
							maxLength={this.state.maxLength}
							minLength={this.state.minLength}
							onCopyTextToClipboard={this.props.onCopyTextToClipboard}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onParamsChanged={this._changeParams}
							onPostArticle={this.props.onPostArticle}
							onReadArticle={this.props.onReadArticle}
							onShare={this.props.onShare}
							onToggleArticleStar={this.props.onToggleArticleStar}
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
	deps: Pick<Props, Exclude<keyof Props, 'highlightedCommentId' | 'highlightedPostId' | 'screenId' | 'user' | 'view'>>
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
						highlightedCommentId: (
							pathParams['highlightedType'] === 'comment' ?
								pathParams['highlightedId'] :
								null
						),
						highlightedPostId: (
							pathParams['highlightedType'] === 'post' ?
								pathParams['highlightedId'] :
								null
						),
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