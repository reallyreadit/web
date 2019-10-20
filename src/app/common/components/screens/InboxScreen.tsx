import * as React from 'react';
import RouteLocation from '../../../../common/routing/RouteLocation';
import Post from '../../../../common/models/social/Post';
import PageResult from '../../../../common/models/PageResult';
import InboxPostsQuery from '../../../../common/models/social/InboxPostsQuery';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ShareChannel from '../../../../common/sharing/ShareChannel';
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

interface Props {
	highlightedCommentId: string | null,
	onClearAlerts: (alert: Alert) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetInboxPosts: FetchFunctionWithParams<InboxPostsQuery, PageResult<Post>>,
	onPostArticle: (article: UserArticle) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
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
	private _hasClearedAlerts = false;
	private readonly _loadNewItems = () => {
		this.setState({ isLoadingNewItems: true });
		this.props.onGetInboxPosts(
			{ pageNumber: 1 },
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
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isLoadingNewItems: false,
			newItemCount: 0,
			posts: props.onGetInboxPosts(
				{ pageNumber: 1 },
				this._asyncTracker.addCallback(
					posts => {
						this.setState({ posts });
						this.clearAlertsIfNeeded();
					}
				)
			)
		};
	}
	private clearAlertsIfNeeded() {
		if (!this._hasClearedAlerts && hasAlert(this.props.user, Alert.Inbox)) {
			this.props.onClearAlerts(Alert.Inbox);
			this._hasClearedAlerts = true;
		}
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
						<ArticleList>
							{this.state.posts.value.items.map(
								post => (
									<li key={post.date}>
										<PostDetails
											highlightedCommentId={this.props.highlightedCommentId}
											onCopyTextToClipboard={this.props.onCopyTextToClipboard}
											onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
											onRead={this.props.onReadArticle}
											onPost={this.props.onPostArticle}
											onShare={this.props.onShare}
											onToggleStar={this.props.onToggleArticleStar}
											onViewComments={this.props.onViewComments}
											onViewThread={this.props.onViewThread}
											post={post}
											user={this.props.user}
										/>
									</li>
								)
							)}
						</ArticleList>
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