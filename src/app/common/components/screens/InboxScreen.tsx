import * as React from 'react';
import RouteLocation from '../../../../common/routing/RouteLocation';
import Post from '../../../../common/models/social/Post';
import PageResult from '../../../../common/models/PageResult';
import InboxPostsQuery from '../../../../common/models/social/InboxPostsQuery';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import ShareData from '../../../../common/sharing/ShareData';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';
import ScreenContainer from '../ScreenContainer';
import LoadingOverlay from '../controls/LoadingOverlay';
import ArticleList from '../controls/articles/ArticleList';
import PostDetails from '../../../../common/components/PostDetails';
import CommentThread from '../../../../common/models/CommentThread';
import UserAccount, { hasAlert } from '../../../../common/models/UserAccount';
import { Screen, SharedState } from '../Root';
import Alert from '../../../../common/models/notifications/Alert';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { formatCountable } from '../../../../common/format';
import UpdateBanner from '../../../../common/components/UpdateBanner';
import Rating from '../../../../common/models/Rating';
import PageSelector from '../controls/PageSelector';
import InfoBox from '../../../../common/components/InfoBox';

interface Props {
	highlightedCommentId: string | null,
	onClearAlerts: (alert: Alert) => void,
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetInboxPosts: FetchFunctionWithParams<InboxPostsQuery, PageResult<Post>>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareResponse,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void
	user: UserAccount
}
interface State {
	isLoadingNewItems: boolean,
	newItemCount: number,
	posts: Fetchable<PageResult<Post>>
}
class InboxScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			posts: {
				isLoading: true
			}
		});
		this.fetchPosts(pageNumber);
	};
	private _hasClearedAlerts = false;
	private readonly _loadNewItems = () => {
		this.setState({
			isLoadingNewItems: true
		});
		this.fetchPosts(1);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isLoadingNewItems: false,
			newItemCount: 0,
			posts: this.fetchPosts(1)
		};
	}
	private clearAlertsIfNeeded() {
		if (!this._hasClearedAlerts && hasAlert(this.props.user, Alert.Inbox)) {
			this.props.onClearAlerts(Alert.Inbox);
			this._hasClearedAlerts = true;
		}
	}
	private fetchPosts(pageNumber: number) {
		return this.props.onGetInboxPosts(
			{
				pageNumber
			},
			this._asyncTracker.addCallback(
				posts => {
					this.setState({
						isLoadingNewItems: false,
						newItemCount: 0,
						posts
					});
					this.clearAlertsIfNeeded();
				}
			)
		);
	}
	public componentDidMount() {
		if (!this.state.posts.isLoading) {
			this.clearAlertsIfNeeded();
		}
	}
	public componentDidUpdate(prevProps: Props) {
		const newItemCount = Math.max(0, (this.props.user.replyAlertCount + this.props.user.loopbackAlertCount) - (prevProps.user.replyAlertCount + prevProps.user.loopbackAlertCount));
		if (newItemCount) {
			this.setState({ newItemCount });
			this._hasClearedAlerts = false;
		}
	}
	public render() {
		return (
			<ScreenContainer className="inbox-screen_yq0iay">
				{this.state.posts.isLoading ?
					<LoadingOverlay position="absolute" /> :
					<>
						{this.state.newItemCount ?
							<UpdateBanner
								isBusy={this.state.isLoadingNewItems}
								onClick={this._loadNewItems}
								text={`Show ${this.state.newItemCount} new ${formatCountable(this.state.newItemCount, 'notification')}`}
							/> :
							null}
						{this.state.posts.value.items.length ?
							<>
								<ArticleList>
									{this.state.posts.value.items.map(
										post => (
											<li key={post.date}>
												<PostDetails
													highlightedCommentId={this.props.highlightedCommentId}
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
								position="absolute"
								style="normal"
							>
								<p>You have 0 notifications.</p>
							</InfoBox>}
					</>}
			</ScreenContainer>
		);
	}
}
export default function createInboxScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'highlightedCommentId' | 'user'>>
) {
	const route = findRouteByKey(routes, ScreenKey.Inbox);
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Notifications' }),
		render: (state: Screen, sharedState: SharedState) => (
			<InboxScreen {
				...{
					...deps,
					highlightedCommentId: route.getPathParams(state.location.path)['commentId'],
					user: sharedState.user
				}
			} />
		)
	};
}