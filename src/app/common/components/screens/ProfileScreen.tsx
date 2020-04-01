import * as React from 'react';
import RouteLocation from '../../../../common/routing/RouteLocation';
import UserAccount from '../../../../common/models/UserAccount';
import { FetchFunctionWithParams, FetchFunction } from '../../serverApi/ServerApi';
import UserNameQuery from '../../../../common/models/social/UserNameQuery';
import Profile from '../../../../common/models/social/Profile';
import UserPostsQuery from '../../../../common/models/social/UserPostsQuery';
import PageResult from '../../../../common/models/PageResult';
import Post from '../../../../common/models/social/Post';
import Fetchable from '../../../../common/Fetchable';
import LoadingOverlay from '../controls/LoadingOverlay';
import LeaderboardBadges from '../../../../common/components/LeaderboardBadges';
import { formatCountable } from '../../../../common/format';
import ArticleList from '../controls/articles/ArticleList';
import UserArticle from '../../../../common/models/UserArticle';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import AsyncTracker from '../../../../common/AsyncTracker';
import PostDetails from '../../../../common/components/PostDetails';
import ActionLink from '../../../../common/components/ActionLink';
import GetFollowersDialog from './ProfileScreen/GetFollowersDialog';
import CommentThread from '../../../../common/models/CommentThread';
import UserNameForm from '../../../../common/models/social/UserNameForm';
import Following from '../../../../common/models/social/Following';
import FollowButton from '../../../../common/components/FollowButton';
import FollowingListDialog from '../FollowingListDialog';
import LeaderboardBadge from '../../../../common/models/LeaderboardBadge';
import PageSelector from '../controls/PageSelector';
import InfoBox from '../../../../common/components/InfoBox';
import Alert from '../../../../common/models/notifications/Alert';
import FolloweeCountChange from '../../../../common/models/social/FolloweeCountChange';
import Rating from '../../../../common/models/Rating';
import Panel from '../BrowserRoot/Panel';
import GetStartedButton from '../BrowserRoot/GetStartedButton';
import { ProfilePage } from 'schema-dts';
import { JsonLd } from 'react-schemaorg';
import StickyNote from '../../../../common/components/StickyNote';
import { DeviceType } from '../../../../common/DeviceType';

interface Props {
	deviceType: DeviceType,
	highlightedCommentId: string | null,
	highlightedPostId: string | null,
	onBeginOnboarding: (analyticsAction: string) => void,
	onClearAlerts: (alert: Alert) => void,
	onCloseDialog: () => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onFollowUser: (form: UserNameForm) => Promise<void>,
	onGetFollowees: FetchFunction<Following[]>,
	onGetFollowers: FetchFunctionWithParams<UserNameQuery, Following[]>,
	onGetPosts: FetchFunctionWithParams<UserPostsQuery, PageResult<Post>>,
	onReloadProfile: (screenId: number, userName: string) => Promise<Profile>,
	onUpdateProfile: (screenId: number, newValues: Partial<Profile>) => void,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterArticlePostedHandler: (handler: (post: Post) => void) => Function,
	onRegisterCommentUpdatedHandler: (handler: (comment: CommentThread) => void) => Function,
	onRegisterFolloweeCountChangedHandler: (handler: (change: FolloweeCountChange) => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onUnfollowUser: (form: UserNameForm) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	profile: Fetchable<Profile>,
	screenId: number,
	userAccount: UserAccount | null,
	userName: string
}
export type Deps = Pick<Props, Exclude<keyof Props, 'highlightedCommentId' | 'highlightedPostId' | 'userAccount' | 'userName'>>;
interface State {
	isFollowingButtonBusy: boolean,
	posts: Fetchable<PageResult<Post>>
}
const postsPageSize = 40;
export class ProfileScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			posts: { isLoading: true }
		});
		this.fetchPosts(pageNumber);
	};
	private readonly _followUser = (form: UserNameForm) => {
		return this.props
			.onFollowUser(form)
			.then(
				() => {
					if (form.userName === this.props.userName) {
						this.setIsFollowed();
					}
				}
			);
	};
	private readonly _openGetFollowersDialog = () => {
		this.props.onOpenDialog(
			<GetFollowersDialog
				onCloseDialog={this.props.onCloseDialog}
				onCopyTextToClipboard={this.props.onCopyTextToClipboard}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onShare={this.props.onShare}
				userName={this.props.userAccount.name}
			/>
		);
	};
	private readonly _showFollowees = () => {
		this.props.onOpenDialog(
			<FollowingListDialog
				onClearAlerts={this.props.onClearAlerts}
				onCloseDialog={this.props.onCloseDialog}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onFollowUser={this._followUser}
				onGetFollowings={this.props.onGetFollowees}
				onUnfollowUser={this._unfollowUser}
				onViewProfile={this.props.onViewProfile}
				title="Following"
				userAccount={this.props.userAccount}
			/>
		);
	};
	private readonly _showFollowers = () => {
		const isOwnProfile = this.isOwnProfile();
		this.props.onOpenDialog(
			<FollowingListDialog
				clearFollowersAlerts={isOwnProfile}
				onClearAlerts={this.props.onClearAlerts}
				onCloseDialog={this.props.onCloseDialog}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onFollowUser={this._followUser}
				onGetFollowings={
					(callback: (value: Fetchable<Following[]>) => void) => this.props.onGetFollowers({ userName: this.props.userName }, callback)
				}
				onUnfollowUser={this._unfollowUser}
				onViewProfile={this.props.onViewProfile}
				title={
					isOwnProfile ?
						"Followers" :
						`Following ${this.props.userName}`
				}
				userAccount={this.props.userAccount}
			/>
		);
	};
	private readonly _unfollowUser = (form: UserNameForm) => {
		return this.props
			.onUnfollowUser(form)
			.then(
				() => {
					if (form.userName === this.props.userName) {
						this.props.onUpdateProfile(
							this.props.screenId,
							{
								isFollowed: false,
								followerCount: this.props.profile.value.followerCount - 1
							}
						);
					}
				}
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isFollowingButtonBusy: false,
			posts: this.fetchPosts(1)
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (
						this.state.posts.value &&
						this.state.posts.value.items.some(post => post.article.id === event.article.id)
					) {
						const postItems = this.state.posts.value.items.slice();
						postItems.forEach(
							(post, index, posts) => {
								if (post.article.id === event.article.id) {
									// merge objects in case the new object is missing properties due to outdated iOS client
									posts.splice(
										index,
										1,
										{
											...post,
											article: {
												...post.article,
												...event.article
											}
										}
									);
								}
							}
						);
						this.setState({
							...this.state,
							posts: {
								...this.state.posts,
								value: {
									...this.state.posts.value,
									items: postItems
								}
							}
						});
					}
				}
			)
		);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticlePostedHandler(
				post => {
					if (this.state.posts.value) {
						this.setState({
							...this.state,
							posts: {
								...this.state.posts,
								value: {
									...this.state.posts.value,
									items: [
										post,
										...this.state.posts.value.items.slice(
											0,
											this.state.posts.value.items.length < postsPageSize ?
												this.state.posts.value.items.length :
												postsPageSize - 1
										)
									]
								}
							}
						});
					}
				}
			),
			props.onRegisterCommentUpdatedHandler(
				comment => {
					if (this.state.posts.value) {
						const post = this.state.posts.value.items.find(post => post.comment && post.comment.id === comment.id);
						if (post) {
							const items = this.state.posts.value.items.slice();
							if (comment.dateDeleted) {
								items.splice(
									items.indexOf(post),
									1
								);
							} else {
								items.splice(
									items.indexOf(post),
									1,
									{
										...post,
										comment: {
											...post.comment,
											text: comment.text,
											addenda: comment.addenda
										}
									}
								);
							}
							this.setState({
								posts: {
									...this.state.posts,
									value: {
										...this.state.posts.value,
										items
									}
								}
							});
						}
					}
				}
			)
		);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterFolloweeCountChangedHandler(
				change => {
					if (this.props.profile.value && this.isOwnProfile()) {
						this.props.onUpdateProfile(
							this.props.screenId,
							{
								followeeCount: Math.max(
									this.props.profile.value.followeeCount + (
										change === FolloweeCountChange.Increment ?
											1 :
											-1
									),
									0
								)
							}
						);
					}
				}
			)
		);
	}
	private fetchPosts(pageNumber: number) {
		return this.props.onGetPosts(
			{
				userName: this.props.userName,
				pageNumber,
				pageSize: postsPageSize
			},
			this._asyncTracker.addCallback(
				posts => {
					this.setState({ posts });
				}
			)
		);
	}
	private isOwnProfile() {
		return this.props.userAccount && this.props.userAccount.name === this.props.userName;
	}
	private setIsFollowed() {
		this.props.onUpdateProfile(
			this.props.screenId,
			{
				isFollowed: true,
				followerCount: this.props.profile.value.followerCount + 1
			}
		);
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			this.props.userName !== prevProps.userName ||
			(
				this.props.userAccount ?
					!prevProps.userAccount || prevProps.userAccount.id !== this.props.userAccount.id :
					!!prevProps.userAccount
			)
		) {
			this.props.onReloadProfile(this.props.screenId, this.props.userName);
			this.fetchPosts(1);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const isOwnProfile = this.isOwnProfile();
		let
			followeesText: string,
			followersText: string;
		if (this.props.profile.value) {
			followeesText = `Following ${this.props.profile.value.followeeCount}`;
			followersText = this.props.profile.value.followerCount + ' ' + formatCountable(this.props.profile.value.followerCount, 'follower');
		}
		return (
			<div className="profile-screen_1u1j1e">
				{this.props.profile.isLoading || this.state.posts.isLoading ?
					<LoadingOverlay position="absolute" /> :
					!this.props.profile.value || !this.state.posts.value ?
						<InfoBox
							position="absolute"
							style="normal"
						>
							<p>Profile not found.</p>
						</InfoBox> :
						<>
							{!this.props.userAccount ?
								<Panel className="header">
									<h1>Join Readup to read with {this.props.profile.value.userName}.</h1>
									<h3>
										<GetStartedButton
											analyticsAction="ProfileScreenCreateAccount"
											deviceType={this.props.deviceType}
											onBeginOnboarding={this.props.onBeginOnboarding}
											onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
											onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
										/>
									</h3>
								</Panel> :
								null}
							<Panel className="main">
								<div className="profile" data-nosnippet>
									<div className="user-name">
										<span className="name">{this.props.profile.value.userName}</span>
										{this.props.profile.value.leaderboardBadge !== LeaderboardBadge.None ?
											<LeaderboardBadges badge={this.props.profile.value.leaderboardBadge} /> :
											null}
									</div>
									{isOwnProfile ?
										<>
											{this.props.profile.value.followeeCount ?
												<ActionLink
													className="following-count"
													onClick={this._showFollowees}
													text={followeesText}
												/> :
												<span className="following-count">{followeesText}</span>}
											<StickyNote>
												<strong>Invite your friends.</strong>
												<span onClick={this._openGetFollowersDialog}>Get followers.</span>
											</StickyNote>
										</> :
										this.props.userAccount ?
											<FollowButton
												following={this.props.profile.value}
												isBusy={this.state.isFollowingButtonBusy}
												onFollow={this._followUser}
												onUnfollow={this._unfollowUser}
												size="large"
											/> :
											null}
									{this.props.profile.value.followerCount ?
										<ActionLink
											badge={isOwnProfile && this.props.userAccount.followerAlertCount}
											className="following-count"
											onClick={this._showFollowers}
											text={followersText}
										/> :
										<span className="following-count">{followersText}</span>}
								</div>
								{this.state.posts.value.items.length ?
									<>
										<ArticleList>
											{this.state.posts.value.items.map(
												post => (
													<li key={post.date}>
														<PostDetails
															highlightedCommentId={this.props.highlightedCommentId}
															highlightedPostId={this.props.highlightedPostId}
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
															user={this.props.userAccount}
														/>
													</li>
												)
											)}
										</ArticleList>
										{this.props.userAccount ?
											<PageSelector
												pageNumber={this.state.posts.value.pageNumber}
												pageCount={this.state.posts.value.pageCount}
												onChange={this._changePageNumber}
											/> :
											null}
									</> :
									null}
							</Panel>
							<JsonLd<ProfilePage>
								item={{
									"@context": "https://schema.org",
									"@type": "ProfilePage",
									"description": `Join Readup to read with ${this.props.profile.value.userName}`,
									"name": this.props.profile.value.userName
								}}
							/>
						</>}
			</div>
		)
	}
}
export function getPathParams(location: RouteLocation) {
	const pathParams = findRouteByKey(routes, ScreenKey.Profile)
		.getPathParams(location.path);
	return {
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
		userName: pathParams['userName']
	};
}