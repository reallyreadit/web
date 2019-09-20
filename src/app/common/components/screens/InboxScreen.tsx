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
import UserAccount from '../../../../common/models/UserAccount';
import { Screen, SharedState } from '../Root';
import Alert from '../../../../common/models/notifications/Alert';

interface Props {
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
	posts: Fetchable<PageResult<Post>>
}
class InboxScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private _hasClearedAlerts = false;
	constructor(props: Props) {
		super(props);
		this.state = {
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
		if (
			!this._hasClearedAlerts &&
			(
				this.props.user.replyAlertCount ||
				this.props.user.loopbackAlertCount
			)
		) {
			this.props.onClearAlerts(Alert.Inbox);
			this._hasClearedAlerts = true;
		}
	}
	public componentDidMount() {
		if (!this.state.posts.isLoading) {
			this.clearAlertsIfNeeded();
		}
	}
	public render() {
		return (
			<ScreenContainer className="inbox-screen_yq0iay">
				{this.state.posts.isLoading ?
					<LoadingOverlay position="absolute" /> :
					<ArticleList>
						{this.state.posts.value.items.map(
							post => (
								<li key={post.date}>
									<PostDetails
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
					</ArticleList>}
			</ScreenContainer>
		);
	}
}
export default function createInboxScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Notifications' }),
		render: (state: Screen, sharedState: SharedState) => (
			<InboxScreen {...{ ...deps, user: sharedState.user }} />
		)
	};
}