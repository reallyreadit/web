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

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow, minLength?: number, maxLength?: number }, CommunityReads>,
	onGetFolloweesPosts: FetchFunctionWithParams<FolloweesPostsQuery, PageResult<Post>>,
	onOpenMenu: () => void,
	onPostArticle: (article: UserArticle) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	user: UserAccount | null
}
interface State {
	communityReads: Fetchable<CommunityReads>,
	isLoading: boolean,
	maxLength?: number,
	minLength?: number,
	posts?: Fetchable<PageResult<Post>>,
	sort: CommunityReadSort,
	timeWindow?: CommunityReadTimeWindow,
	view: View
}
class HomeScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeParams = (view: View, sort: CommunityReadSort, timeWindow: CommunityReadTimeWindow | null, minLength: number | null, maxLength: number | null) => {
		this.setState({
			isLoading: true,
			view, sort, timeWindow, minLength, maxLength
		});
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
				switch (this.state.view) {
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
		this.state = {
			communityReads: props.onGetCommunityReads(
				{ pageNumber: 1, pageSize: 10, sort: CommunityReadSort.Hot },
				this._asyncTracker.addCallback(communityReads => {
					this.setState({ communityReads });
				})
			),
			isLoading: false,
			sort: CommunityReadSort.Hot,
			view: View.Trending
		};
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
					this.state.communityReads.isLoading ||
					(this.state.posts && this.state.posts.isLoading)
				) ?
					<LoadingOverlay position="static" /> :
					<>
						{(
							this.props.user &&
							!this.state.communityReads.value.userReadCount
						) ?
							<WelcomeInfoBox /> :
							null}
						<CommunityReadsList
							aotd={this.state.communityReads.value.aotd}
							articles={this.state.communityReads.value.articles}
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
							view={this.state.view}
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
		create: (location: RouteLocation) => ({
			key,
			location,
			title: 'Discover'
		}),
		render: (screenState: Screen, sharedState: SharedState) => (
			<HomeScreen {...{ ...deps, user: sharedState.user }} />
		)
	};
}