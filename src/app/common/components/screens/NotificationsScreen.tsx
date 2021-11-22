import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
import HeaderSelector from '../HeaderSelector';
import Post from '../../../../common/models/social/Post';
import Fetchable from '../../../../common/Fetchable';
import LoadingOverlay from '../controls/LoadingOverlay';
import UpdateBanner from '../../../../common/components/UpdateBanner';
import { formatCountable } from '../../../../common/format';
import PageResult from '../../../../common/models/PageResult';
import List from '../controls/List';
import PostDetails from '../../../../common/components/PostDetails';
import PageSelector from '../controls/PageSelector';
import CenteringContainer from '../../../../common/components/CenteringContainer';
import StickyNote from '../../../../common/components/StickyNote';
import Alert from '../../../../common/models/notifications/Alert';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import NotificationPostsQuery from '../../../../common/models/social/NotificationPostsQuery';
import ReplyPostsQuery from '../../../../common/models/social/ReplyPostsQuery';
import UserArticle from '../../../../common/models/UserArticle';
import Rating from '../../../../common/models/Rating';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import CommentThread from '../../../../common/models/CommentThread';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState } from '../Root';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import {DeviceType} from '../../../../common/DeviceType';
import { ShareChannelData } from '../../../../common/sharing/ShareData';

interface Props {
	deviceType: DeviceType,
	onClearAlerts: (alert: Alert) => void,
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetNotificationPosts: FetchFunctionWithParams<NotificationPostsQuery, PageResult<Post>>,
	onGetReplyPosts: FetchFunctionWithParams<ReplyPostsQuery, PageResult<Post>>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	user: UserAccount
}
enum View {
	Posts = 'Posts',
	Replies = 'Replies'
}
interface State {
	isLoadingNewItems: boolean,
	isScreenLoading: boolean,
	newItemCount: number,
	posts: Fetchable<PageResult<Post>>,
	view: View
}
class NotificationsScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePage = (pageNumber: number) => {
		this.setState({
			isLoadingNewItems: false,
			newItemCount: 0,
			posts: this.fetchPosts(this.state.view, pageNumber)
		});
	};
	private readonly _changeView = (value: string) => {
		const view = value as View;
		if (view === this.state.view) {
			return;
		}
		this.setState({
			isLoadingNewItems: false,
			newItemCount: 0,
			posts: this.fetchPosts(view, 1),
			view
		});
	};
	private readonly _loadNewItems = () => {
		this.setState({
			isLoadingNewItems: true
		});
		this.fetchPosts(this.state.view, 1);
	};
	constructor(props: Props) {
		super(props);
		const
			view = View.Posts,
			posts = this.fetchPosts(view, 1);
		this.state = {
			isLoadingNewItems: false,
			isScreenLoading: posts.isLoading,
			newItemCount: 0,
			posts,
			view
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
													...event.article,
													dateStarred: event.article.dateStarred
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
	private checkAlertState() {
		let alerts: Alert;
		switch (this.state.view) {
			case View.Posts:
				alerts = Alert.Post | Alert.Loopback;
				break;
			case View.Replies:
				alerts = Alert.Reply;
				break;
		}
		if (hasAnyAlerts(this.props.user, alerts)) {
			this.props.onClearAlerts(alerts);
		}
	}
	private fetchPosts(view: View, pageNumber: number) {
		let fetchFunction: FetchFunctionWithParams<NotificationPostsQuery & ReplyPostsQuery, PageResult<Post>>;
		switch (view) {
			case View.Posts:
				fetchFunction = this.props.onGetNotificationPosts;
				break;
			case View.Replies:
				fetchFunction = this.props.onGetReplyPosts;
		}
		return fetchFunction(
			{
				pageNumber
			},
			this._asyncTracker.addCallback(
				posts => {
					this.setState({
						isLoadingNewItems: false,
						isScreenLoading: false,
						posts,
						newItemCount: 0
					});
					this.checkAlertState();
				}
			)
		);
	}
	private getUpdateBannerText() {
		switch (this.state.view) {
			case View.Posts:
				return `Show ${this.state.newItemCount} new ${formatCountable(this.state.newItemCount, 'post')}`;
			case View.Replies:
				return `Show ${this.state.newItemCount} new ${formatCountable(this.state.newItemCount, 'reply', 'replies')}`;
		}
	}
	public componentDidMount() {
		this.checkAlertState();
	}
	public componentDidUpdate(prevProps: Props) {
		let newItemCount: number;
		switch (this.state.view) {
			case View.Posts:
				newItemCount = Math.max(
					0,
					(this.props.user.postAlertCount - prevProps.user.postAlertCount) +
					(this.props.user.loopbackAlertCount - prevProps.user.loopbackAlertCount)
				);
				break;
			case View.Replies:
				newItemCount = Math.max(0, this.props.user.replyAlertCount - prevProps.user.replyAlertCount);
				break;
		}
		if (newItemCount) {
			this.setState({
				newItemCount
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="notifications-screen_qjaly4">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="static" /> :
					<>
						{this.state.newItemCount ?
							<UpdateBanner
								isBusy={this.state.isLoadingNewItems}
								onClick={this._loadNewItems}
								text={this.getUpdateBannerText()}
							/> :
							null}
						<HeaderSelector
							disabled={this.state.posts.isLoading || this.state.isLoadingNewItems}
							items={[
								{
									value: View.Posts,
									badge: this.props.user.postAlertCount + this.props.user.loopbackAlertCount
								},
								{
									value: View.Replies,
									badge: this.props.user.replyAlertCount
								}
							]}
							onChange={this._changeView}
							value={this.state.view}
						/>
						{this.state.posts.isLoading ?
							<LoadingOverlay position="static" /> :
							this.state.posts.value.items.length ?
								<>
									<List>
										{this.state.posts.value.items.map(
											post => (
												<li key={post.date}>
													<PostDetails
														deviceType={this.props.deviceType}
														onCloseDialog={this.props.onCloseDialog}
														onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
														onNavTo={this.props.onNavTo}
														onOpenDialog={this.props.onOpenDialog}
														onRateArticle={this.props.onRateArticle}
														onRead={this.props.onReadArticle}
														onPost={this.props.onPostArticle}
														onShare={this.props.onShare}
														onShareViaChannel={this.props.onShareViaChannel}
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
									</List>
									<PageSelector
										pageNumber={this.state.posts.value.pageNumber}
										pageCount={this.state.posts.value.pageCount}
										onChange={this._changePage}
									/>
								</> :
								<CenteringContainer>
									<StickyNote>
										{this.state.view === View.Posts ?
											<>
												<strong>Follow readers who interest you.</strong>
												<span>Their posts will appear here.</span>
											</> :
											<span>No replies found.</span>}
									</StickyNote>
								</CenteringContainer>}
					</>}
			</ScreenContainer>
		);
	}
}
export default function createNotificationsScreenFactory<TScreenKey>(
	key: TScreenKey,
	services: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Notifications'
		}),
		render: (screen: Screen, sharedState: SharedState) => (
			<NotificationsScreen
				deviceType={services.deviceType}
				onClearAlerts={services.onClearAlerts}
				onCloseDialog={services.onCloseDialog}
				onCreateAbsoluteUrl={services.onCreateAbsoluteUrl}
				onGetNotificationPosts={services.onGetNotificationPosts}
				onGetReplyPosts={services.onGetReplyPosts}
				onNavTo={services.onNavTo}
				onOpenDialog={services.onOpenDialog}
				onPostArticle={services.onPostArticle}
				onRateArticle={services.onRateArticle}
				onReadArticle={services.onReadArticle}
				onRegisterArticleChangeHandler={services.onRegisterArticleChangeHandler}
				onShare={services.onShare}
				onShareViaChannel={services.onShareViaChannel}
				onToggleArticleStar={services.onToggleArticleStar}
				onViewComments={services.onViewComments}
				onViewProfile={services.onViewProfile}
				onViewThread={services.onViewThread}
				user={sharedState.user}
			/>
		)
	};
}