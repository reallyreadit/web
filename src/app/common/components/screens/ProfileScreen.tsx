import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
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
import { Screen, SharedState, TemplateSection } from '../Root';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Button from '../../../../common/components/Button';
import AsyncTracker from '../../../../common/AsyncTracker';
import PostDetails from '../../../../common/components/PostDetails';
import ActionLink from '../../../../common/components/ActionLink';
import GetFollowersDialog from './ProfileScreen/GetFollowersDialog';
import CommentThread from '../../../../common/models/CommentThread';
import UserNameForm from '../../../../common/models/social/UserNameForm';
import Following from '../../../../common/models/social/Following';
import FollowButton from '../../../../common/components/FollowButton';
import FollowingListDialog from '../FollowingListDialog';
import produce from 'immer';
import CreateAccountDialog from '../CreateAccountDialog';
import Captcha from '../../Captcha';
import { Intent } from '../../../../common/components/Toaster';
import SignInDialog from '../SignInDialog';
import LeaderboardBadge from '../../../../common/models/LeaderboardBadge';
import DownloadIosAppDialog from '../BrowserRoot/ProfileScreen/DownloadIosAppDialog';
import ContentBox from '../../../../common/components/ContentBox';
import PageSelector from '../controls/PageSelector';
import InfoBox from '../controls/InfoBox';
import Alert from '../../../../common/models/notifications/Alert';
import FolloweeCountChange from '../../../../common/models/social/FolloweeCountChange';
import Rating from '../../../../common/models/Rating';

const route = findRouteByKey(routes, ScreenKey.Profile);
interface Props {
	captcha: Captcha,
	highlightedCommentId: string | null,
	highlightedPostId: string | null,
	isDesktopDevice: boolean,
	isIosDevice: boolean | null,
	onClearAlerts: (alert: Alert) => void,
	onCloseDialog: () => void,
	onCopyAppReferrerTextToClipboard: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateAccount: (name: string, email: string, password: string, captchaResponse: string) => Promise<void>,
	onFollowUser: (form: UserNameForm) => Promise<void>,
	onGetFollowees: FetchFunction<Following[]>,
	onGetFollowers: FetchFunctionWithParams<UserNameQuery, Following[]>,
	onGetPosts: FetchFunctionWithParams<UserPostsQuery, PageResult<Post>>,
	onGetProfile: FetchFunctionWithParams<UserNameQuery, Profile>,
	onInstallExtension: () => void,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onOpenPasswordResetRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterArticlePostedHandler: (handler: (post: Post) => void) => Function,
	onRegisterFolloweeCountChangedHandler: (handler: (change: FolloweeCountChange) => void) => Function,
	onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSignIn: (emailAddress: string, password: string) => Promise<void>,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onUnfollowUser: (form: UserNameForm) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	screenId: number,
	userAccount: UserAccount | null,
	userName: string
}
export type Deps = Pick<Props, Exclude<keyof Props, 'highlightedCommentId' | 'highlightedPostId' | 'userAccount' | 'userName'>>;
interface State {
	isFollowingButtonBusy: boolean,
	profile: Fetchable<Profile>,
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
	private _followOnSignIn: boolean;
	private readonly _followUser = (form: UserNameForm) => {
		if (this.props.userAccount) {
			return this.props
				.onFollowUser(form)
				.then(
					() => {
						if (form.userName === this.props.userName) {
							this.setIsFollowed();
						}
					}
				);
		}
		this._followOnSignIn = true;
		const cancel = () => {
			this._followOnSignIn = false;
			this.props.onCloseDialog();
		};
		this.props.onOpenDialog(
			this.props.isIosDevice ?
				<DownloadIosAppDialog
					onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
					onClose={cancel}
				/> :
				<CreateAccountDialog
					captcha={this.props.captcha}
					onCreateAccount={this.props.onCreateAccount}
					onCloseDialog={cancel}
					onShowToast={this.props.onShowToast}
					onSignIn={
						this.props.isDesktopDevice ?
							() => {
								this.props.onOpenDialog(
									<SignInDialog
										onOpenPasswordResetDialog={this.props.onOpenPasswordResetRequestDialog}
										onCloseDialog={cancel}
										onShowToast={this.props.onShowToast}
										onSignIn={this.props.onSignIn}
									/>
								);
							} :
							null
					}
					title={`Sign up to follow ${this.props.userName}`}
				/>
		);
		return Promise.resolve();
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
						this.setState(
							produce(
								(state: State) => {
									state.profile.value.isFollowed = false;
									state.profile.value.followerCount--;
								}
							)
						);
					}
				}
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isFollowingButtonBusy: false,
			profile: this.fetchProfile(),
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
			)
		);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterFolloweeCountChangedHandler(
				change => {
					if (this.state.profile.value && this.isOwnProfile()) {
						this.setState({
							profile: {
								...this.state.profile,
								value: {
									...this.state.profile.value,
									followeeCount: Math.max(
										this.state.profile.value.followeeCount + (
											change === FolloweeCountChange.Increment ?
												1 :
												-1
										),
										0
									)
								}
							}
						});
					}
				}
			)
		);
	}
	private fetchProfile(callback?: (profile: Profile) => void) {
		return this.props.onGetProfile(
			{ userName: this.props.userName },
			this._asyncTracker.addCallback(
				profile => {
					this.setState({ profile });
					if (callback) {
						callback(profile.value);
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
		this.setState(
			produce(
				(state: State) => {
					state.profile.value.isFollowed = true;
					state.profile.value.followerCount++;
				}
			)
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
			let profileCallback: (profile: Profile) => void;
			if (this.props.userAccount && !prevProps.userAccount) {
				this.props.onSetScreenState(this.props.screenId, () => ({ templateSection: null }));
				if (this._followOnSignIn) {
					if (!this.isOwnProfile()) {
						this.setState({ isFollowingButtonBusy: true });
						profileCallback = profile => {
							if (!profile.isFollowed) {
								this.props
									.onFollowUser({ userName: profile.userName })
									.then(
										() => {
											this.setState({ isFollowingButtonBusy: false });
											this.setIsFollowed();
										}
									)
							} else {
								this.setState({ isFollowingButtonBusy: false });
							}
						};
					}
					this._followOnSignIn = false;
				}
			} else if (!this.props.userAccount && prevProps.userAccount) {
				this.props.onSetScreenState(this.props.screenId, () => ({ templateSection: TemplateSection.Header }));
			}
			this.fetchProfile(profileCallback);
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
		if (this.state.profile.value) {
			followeesText = `Following ${this.state.profile.value.followeeCount}`;
			followersText = this.state.profile.value.followerCount + ' ' + formatCountable(this.state.profile.value.followerCount, 'follower');
		}
		return (
			<ScreenContainer className="profile-screen_1u1j1e">
				{this.state.profile.isLoading || this.state.posts.isLoading ?
					<LoadingOverlay position="static" /> :
					<>
						<div className="profile">
							<div className="user-name">
								<span className="name">{this.state.profile.value.userName}</span>
								{this.state.profile.value.leaderboardBadge !== LeaderboardBadge.None ?
									<LeaderboardBadges badge={this.state.profile.value.leaderboardBadge} /> :
									null}
							</div>
							{isOwnProfile ?
								<>
									{this.state.profile.value.followeeCount ?
										<ActionLink
											className="following-count followees"
											onClick={this._showFollowees}
											text={followeesText}
										/> :
										<span className="following-count followees">{followeesText}</span>}
									<Button
										onClick={this._openGetFollowersDialog}
										text="Get Followers"
										intent="loud"
										size="large"
									/>
								</> :
								<FollowButton
									following={this.state.profile.value}
									isBusy={this.state.isFollowingButtonBusy}
									onFollow={this._followUser}
									onUnfollow={this._unfollowUser}
									size="large"
								/>}
							{this.state.profile.value.followerCount ?
								<ActionLink
									badge={isOwnProfile && this.props.userAccount.followerAlertCount}
									className="following-count followers"
									onClick={this._showFollowers}
									text={followersText}
								/> :
								<span className="following-count followers">{followersText}</span>}
						</div>
						{this.props.userAccount && !this.props.isDesktopDevice && !this.props.isIosDevice ?
							<ContentBox className="unsupported">
								<span className="text">Get Readup on iOS and Chrome</span>
								<div className="badges">
									<a href="https://itunes.apple.com/us/app/reallyread-it/id1441825432">
										<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
									</a>
									<a onClick={this.props.onInstallExtension}>
										<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
									</a>
								</div>
							</ContentBox> :
							null}
						{this.state.posts.value.items.length ?
							<>
								<ArticleList>
									{this.state.posts.value.items.map(
										post => (
											<li key={post.date}>
												<PostDetails
													highlightedCommentId={this.props.highlightedCommentId}
													highlightedPostId={this.props.highlightedPostId}
													onCopyTextToClipboard={this.props.onCopyTextToClipboard}
													onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
													onRateArticle={this.props.onRateArticle}
													onRead={this.props.onReadArticle}
													onPost={this.props.onPostArticle}
													onShare={this.props.onShare}
													onToggleStar={this.props.onToggleArticleStar}
													onViewComments={this.props.onViewComments}
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
							<InfoBox
								position="static"
								style="normal"
							>
								{isOwnProfile ?
									<>
										<p>You haven't posted anything.</p>
									</> :
									<>
										<p>This user hasn't posted anything.</p>
									</>}
							</InfoBox>}
					</>}
			</ScreenContainer>
		)
	}
}
export function getProps(deps: Deps, state: Screen, sharedState: SharedState) {
	const pathParams = route.getPathParams(state.location.path);
	return {
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
		userAccount: sharedState.user,
		userName: pathParams['userName']
	};
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Deps
) {
	return {
		create: (location: RouteLocation) => ({ key, location, title: 'Profile' }),
		render: (state: Screen, sharedState: SharedState) => (
			<ProfileScreen {...getProps(deps, state, sharedState)} />
		)
	};
}