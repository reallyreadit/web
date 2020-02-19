import * as React from 'react';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SharedState, Screen } from '../Root';
import UserAccount, { hasAlert } from '../../../../common/models/UserAccount';
import Post from '../../../../common/models/social/Post';
import PageResult from '../../../../common/models/PageResult';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import Rating from '../../../../common/models/Rating';
import CommentThread from '../../../../common/models/CommentThread';
import AsyncTracker from '../../../../common/AsyncTracker';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import FolloweesPostsQuery from '../../../../common/models/social/FolloweesPostsQuery';
import ScreenContainer from '../ScreenContainer';
import LoadingOverlay from '../controls/LoadingOverlay';
import ArticleLengthFilter from '../controls/ArticleLengthFilter';
import ArticleList from '../controls/articles/ArticleList';
import PostDetails from '../../../../common/components/PostDetails';
import InfoBox from '../controls/InfoBox';
import PageSelector from '../controls/PageSelector';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import Alert from '../../../../common/models/notifications/Alert';
import UpdateBanner from '../../../../common/components/UpdateBanner';
import { formatCountable } from '../../../../common/format';
import produce from 'immer';

interface Props {
	onClearAlerts: (alert: Alert) => void,
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetPosts: FetchFunctionWithParams<FolloweesPostsQuery, PageResult<Post>>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	user: UserAccount
}
interface State {
	isLoadingNewItems: boolean,
	isScreenLoading: boolean,
	maxLength: number | null,
	minLength: number | null,
	newItemCount: number,
	posts: Fetchable<PageResult<Post>>
}
class MyFeedScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeLengthRange = (minLength: number | null, maxLength: number | null) => {
		this.setState({
			posts: {
				isLoading: true
			},
			minLength,
			maxLength
		});
		this.fetchPosts(1, minLength, maxLength);
	};
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			posts: {
				isLoading: true
			},
			isLoadingNewItems: false,
			newItemCount: 0
		});
		this.fetchPosts(pageNumber, this.state.minLength, this.state.maxLength);
	};
	private _hasClearedAlert = false;
	private readonly _loadNewItems = () => {
		this.setState({
			isLoadingNewItems: true,
			minLength: null,
			maxLength: null
		});
		this.fetchPosts(1, null, null);
	};
	constructor(props: Props) {
		super(props);
		const
			minLength: number | null = null,
			maxLength: number | null = null,
			posts = this.fetchPosts(
				1,
				minLength,
				maxLength
			);
		this.state = {
			isLoadingNewItems: false,
			isScreenLoading: posts.isLoading,
			maxLength,
			minLength,
			newItemCount: 0,
			posts
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (
						this.state.posts.value &&
						this.state.posts.value.items.some(
							post => post.article.id === event.article.id
						)
					) {
						this.setState(
							produce(
								(prevState: State) => {
									prevState.posts.value.items.forEach(
										(post, index, posts) => {
											if (post.article.id === event.article.id) {
												// merge objects in case the new object is missing properties due to outdated iOS client
												post.article = {
													...post.article,
													...event.article
												};
											}
										}
									);
								}
							)
						);
					}
				}
			)
		);
	}
	private clearAlertIfNeeded() {
		if (!this._hasClearedAlert && hasAlert(this.props.user, Alert.Following)) {
			this.props.onClearAlerts(Alert.Following);
			this._hasClearedAlert = true;
		}
	}
	private fetchPosts(
		pageNumber: number,
		minLength: number | null,
		maxLength: number | null
	) {
		return this.props.onGetPosts(
			{
				pageNumber,
				minLength,
				maxLength
			},
			this._asyncTracker.addCallback(
				posts => {
					this.setState({
						isLoadingNewItems: false,
						isScreenLoading: false,
						posts,
						newItemCount: 0
					});
					this.clearAlertIfNeeded();
				}
			)
		);
	}
	public componentDidMount() {
		this.clearAlertIfNeeded();
	}
	public componentDidUpdate(prevProps: Props) {
		if (this.props.user && prevProps.user) {
			const newItemCount = Math.max(0, this.props.user.postAlertCount - prevProps.user.postAlertCount);
			if (newItemCount) {
				this.setState({
					newItemCount
				});
				this._hasClearedAlert = false;
			}
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="my-feed-screen_921ddo">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="absolute" /> :
					<>
						{this.state.newItemCount ?
							<UpdateBanner
								isBusy={this.state.isLoadingNewItems}
								onClick={this._loadNewItems}
								text={`Show ${this.state.newItemCount} new ${formatCountable(this.state.newItemCount, 'post')}`}
							/> :
							null}
						<div className="controls">
							<ArticleLengthFilter
								max={this.state.maxLength}
								min={this.state.minLength}
								onChange={this._changeLengthRange}
							/>
						</div>
						{this.state.posts.isLoading ?
							<LoadingOverlay position="static" /> :
							this.state.posts.value.items.length ?
								<>
									<ArticleList>
										{this.state.posts.value.items.map(
											post => (
												<li key={post.date}>
													<PostDetails
														onCloseDialog={this.props.onCloseDialog}
														onCopyTextToClipboard={this.props.onCopyTextToClipboard}
														onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
														onNavTo={this.props.onNavTo}
														onOpenDialog={this.props.onOpenDialog}
														onRateArticle={this.props.onRateArticle}
														onRead={this.props.onReadArticle}
														onPost={this.props.onPostArticle}
														onShare={this.props.onShare}
														onToggleStar={this.props.onToggleArticleStar}
														onViewComments={this.props.onViewComments}
														onViewProfile={this.props.onViewProfile}
														onViewThread={this.props.onViewThread}
														post={post}
														user={this.props.user}
													/>
												</li>
											)
										)}
									</ArticleList>
									<PageSelector
										pageNumber={this.state.posts.value.pageNumber}
										pageCount={this.state.posts.value.pageCount}
										onChange={this._changePageNumber}
									/>
								</> :
								<InfoBox
									position="static"
									style="normal"
								>
									<p>No posts from users you're following.</p>
								</InfoBox>}
						</>}
			</ScreenContainer>
		);
	}
}
export default function createMyFeedScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'My Feed' }),
		render: (screen: Screen, sharedState: SharedState) => (
			<MyFeedScreen {
				...{
					...deps,
					user: sharedState.user
				}
			} />
		)
	};
}