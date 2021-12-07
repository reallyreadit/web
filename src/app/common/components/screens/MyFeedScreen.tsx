import * as React from 'react';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SharedState, Screen } from '../Root';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import Post from '../../../../common/models/social/Post';
import PageResult from '../../../../common/models/PageResult';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import Rating from '../../../../common/models/Rating';
import CommentThread from '../../../../common/models/CommentThread';
import AsyncTracker from '../../../../common/AsyncTracker';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import ScreenContainer from '../ScreenContainer';
import LoadingOverlay from '../controls/LoadingOverlay';
import List from '../controls/List';
import PostDetails from '../../../../common/components/PostDetails';
import PageSelector from '../controls/PageSelector';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import Alert from '../../../../common/models/notifications/Alert';
import UpdateBanner from '../../../../common/components/UpdateBanner';
import { formatCountable } from '../../../../common/format';
import produce from 'immer';
import StickyNote from '../../../../common/components/StickyNote';
import CenteringContainer from '../../../../common/components/CenteringContainer';
import NotificationPostsQuery from '../../../../common/models/social/NotificationPostsQuery';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import {ShareEvent} from '../../../../common/sharing/ShareEvent';
import {DeviceType} from '../../../../common/DeviceType';
import {ShareChannelData} from '../../../../common/sharing/ShareData';

interface Props {
	deviceType: DeviceType,
	onClearAlerts: (alert: Alert) => void,
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetNotificationPosts: FetchFunctionWithParams<NotificationPostsQuery, PageResult<Post>>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	user: UserAccount
}
interface State {
	isLoadingNewItems: boolean,
	isScreenLoading: boolean,
	newItemCount: number,
	posts: Fetchable<PageResult<Post>>
}

const postAlerts = Alert.Post | Alert.Loopback;
class MyFeedScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			posts: {
				isLoading: true
			},
			isLoadingNewItems: false,
			newItemCount: 0
		});
		this.fetchPosts(pageNumber);
	};
	private _hasClearedAlert = false;
	private readonly _loadNewItems = () => {
		this.setState({
			isLoadingNewItems: true,
		});
		this.fetchPosts(1);
	};
	constructor(props: Props) {
		super(props);
		const
			posts = this.fetchPosts(
				1
			);
		this.state = {
			isLoadingNewItems: false,
			isScreenLoading: posts.isLoading,
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
		if (!this._hasClearedAlert && hasAnyAlerts(this.props.user, postAlerts)) {
			this.props.onClearAlerts(postAlerts);
			this._hasClearedAlert = true;
		}
	}
	private fetchPosts(
		pageNumber: number,
	) {
		return this.props.onGetNotificationPosts(
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
			const newItemCount = Math.max(
				0,
				(this.props.user.postAlertCount - prevProps.user.postAlertCount) +
				(this.props.user.loopbackAlertCount - prevProps.user.loopbackAlertCount)
			);
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
					<LoadingOverlay position="static" /> :
					<>
						{this.state.newItemCount ?
							<UpdateBanner
								isBusy={this.state.isLoadingNewItems}
								onClick={this._loadNewItems}
								text={`Show ${this.state.newItemCount} new ${formatCountable(this.state.newItemCount, 'post')}`}
							/> :
							null}
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
										onChange={this._changePageNumber}
									/>
								</> :
								<CenteringContainer>
									<StickyNote>
										<strong>Follow readers who interest you.</strong>
										<span>Their posts will appear here.</span>
									</StickyNote>
								</CenteringContainer>}
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