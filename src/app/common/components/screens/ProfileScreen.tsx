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
import { formatCountable, formatCurrency } from '../../../../common/format';
import UserArticle from '../../../../common/models/UserArticle';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import ShareData from '../../../../common/sharing/ShareData';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import AsyncTracker from '../../../../common/AsyncTracker';
import Link from '../../../../common/components/Link';
import GetFollowersDialog from './ProfileScreen/GetFollowersDialog';
import CommentThread from '../../../../common/models/CommentThread';
import UserNameForm from '../../../../common/models/social/UserNameForm';
import Following from '../../../../common/models/social/Following';
import FollowButton from '../../../../common/components/FollowButton';
import FollowingListDialog from '../FollowingListDialog';
import LeaderboardBadge from '../../../../common/models/LeaderboardBadge';
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
import AuthorArticleQuery from '../../../../common/models/articles/AuthorArticleQuery';
import Icon from '../../../../common/components/Icon';
import * as classNames from 'classnames';
import { PostList } from '../PostList';
import HeaderSelector from '../HeaderSelector';
import { ArticleList } from '../ArticleList';

interface Props {
	deviceType: DeviceType,
	highlightedCommentId: string | null,
	highlightedPostId: string | null,
	location: RouteLocation,
	onBeginOnboarding: (analyticsAction: string) => void,
	onClearAlerts: (alert: Alert) => void,
	onCloseDialog: () => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateStaticContentUrl: (path: string) => string,
	onFollowUser: (form: UserNameForm) => Promise<void>,
	onGetAuthorArticles: FetchFunctionWithParams<AuthorArticleQuery, PageResult<UserArticle>>,
	onGetFollowees: FetchFunction<Following[]>,
	onGetFollowers: FetchFunctionWithParams<UserNameQuery, Following[]>,
	onGetPosts: FetchFunctionWithParams<UserPostsQuery, PageResult<Post>>,
	onReloadProfile: (screenId: number, userName: string, user: UserAccount | null) => Promise<Profile>,
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
	onShare: (data: ShareData) => ShareResponse,
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
enum View {
	Articles = 'Articles',
	Indeterminate = 'Indeterminate',
	Posts = 'Posts'
}
type BaseState = {
	isFollowingButtonBusy: boolean
};
type ArticlesState = BaseState & {
	view: View.Articles,
	articles: Fetchable<PageResult<UserArticle>>
};
type IndeterminateState = BaseState & {
	view: View.Indeterminate
};
type PostsState = BaseState & {
	view: View.Posts,
	posts: Fetchable<PageResult<Post>>
};
type State = IndeterminateState | ArticlesState | PostsState;
const
	listPageSize = 40,
	headerSelectorItems = [
		{
			value: View.Articles
		},
		{
			value: View.Posts
		}
	];

export class ProfileScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeArticles = (articles: Fetchable<PageResult<UserArticle>>) => {
		this.setState({
			view: View.Articles,
			isFollowingButtonBusy: this.state.isFollowingButtonBusy,
			articles
		});
	};
	private readonly _changeArticlesPageNumber = (_: number) => {
		this.setState({
			view: View.Articles,
			isFollowingButtonBusy: this.state.isFollowingButtonBusy,
			articles: { isLoading: true }
		});
		this.fetchArticles();
	};
	private readonly _changePosts = (posts: Fetchable<PageResult<Post>>) => {
		this.setState({
			view: View.Posts,
			isFollowingButtonBusy: this.state.isFollowingButtonBusy,
			posts
		});
	};
	private readonly _changePostsPageNumber = (pageNumber: number) => {
		this.setState({
			view: View.Posts,
			isFollowingButtonBusy: this.state.isFollowingButtonBusy,
			posts: { isLoading: true }
		});
		this.fetchPosts(pageNumber);
	};
	private readonly _changeView = (value: string) => {
		const view = value as View;
		if (view === this.state.view) {
			return;
		}
		switch (view) {
			case View.Articles:
				this.setState({
					view,
					isFollowingButtonBusy: this.state.isFollowingButtonBusy,
					articles: {
						isLoading: true
					}
				});
				this.fetchArticles();
				break;
			case View.Posts:
				this.setState({
					view,
					isFollowingButtonBusy: this.state.isFollowingButtonBusy,
					posts: {
						isLoading: true
					}
				});
				this.fetchPosts(1);
				break;
		}
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
		if (props.profile.isLoading || !props.profile.value) {
			this.state = {
				view: View.Indeterminate,
				isFollowingButtonBusy: false
			};
		} else if (
			props.profile.value.authorProfile &&
			!props.highlightedCommentId &&
			!props.highlightedPostId
		) {
			this.state = {
				view: View.Articles,
				isFollowingButtonBusy: false,
				articles: this.fetchArticles()
			};
		} else {
			this.state = {
				view: View.Posts,
				isFollowingButtonBusy: false,
				posts: this.fetchPosts(1)
			};
		}
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
	private fetchArticles() {
		return this.props.onGetAuthorArticles(
			{
				maxLength: null,
				minLength: null,
				pageNumber: 1,
				pageSize: listPageSize,
				slug: this.props.profile.value.authorProfile.slug
			},
			this._asyncTracker.addCallback(
				articles => {
					this.setState({
						view: View.Articles,
						isFollowingButtonBusy: this.state.isFollowingButtonBusy,
						articles
					});
				}
			)
		);
	}
	private fetchPosts(pageNumber: number) {
		return this.props.onGetPosts(
			{
				userName: this.props.userName,
				pageNumber,
				pageSize: listPageSize
			},
			this._asyncTracker.addCallback(
				posts => {
					this.setState({
						view: View.Posts,
						isFollowingButtonBusy: this.state.isFollowingButtonBusy,
						posts
					});
				}
			)
		);
	}
	private isOwnProfile() {
		return this.props.userAccount && this.props.userAccount.name === this.props.userName;
	}
	private renderList() {
		switch (this.state.view) {
			case View.Indeterminate:
				return null;
			case View.Articles:
				return (
					<ArticleList
						articles={this.state.articles}
						emptyListMessage="No articles found."
						onChangeArticles={this._changeArticles}
						onChangePageNumber={this._changeArticlesPageNumber}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onPostArticle={this.props.onPostArticle}
						onRateArticle={this.props.onRateArticle}
						onReadArticle={this.props.onReadArticle}
						onRegisterArticleChangeHandler={this.props.onRegisterArticleChangeHandler}
						onShare={this.props.onShare}
						onToggleArticleStar={this.props.onToggleArticleStar}
						onViewComments={this.props.onViewComments}
						onViewProfile={this.props.onViewProfile}
						paginate={false}
						userAccount={this.props.userAccount}
					/>
				);
			case View.Posts:
				return (
					<PostList
						addNewPosts={this.isOwnProfile()}
						emptyListMessage={
							this.isOwnProfile() ?
								'You haven\'t posted anything yet.' :
								`${this.props.userName} hasn't posted anything yet.`
						}
						highlightedCommentId={this.props.highlightedCommentId}
						highlightedPostId={this.props.highlightedPostId}
						onChangePageNumber={this._changePostsPageNumber}
						onChangePosts={this._changePosts}
						onCloseDialog={this.props.onCloseDialog}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onNavTo={this.props.onNavTo}
						onOpenDialog={this.props.onOpenDialog}
						onPostArticle={this.props.onPostArticle}
						onRateArticle={this.props.onRateArticle}
						onReadArticle={this.props.onReadArticle}
						onRegisterArticleChangeHandler={this.props.onRegisterArticleChangeHandler}
						onRegisterArticlePostedHandler={this.props.onRegisterArticlePostedHandler}
						onRegisterCommentUpdatedHandler={this.props.onRegisterCommentUpdatedHandler}
						onShare={this.props.onShare}
						onToggleArticleStar={this.props.onToggleArticleStar}
						onViewComments={this.props.onViewComments}
						onViewProfile={this.props.onViewProfile}
						onViewThread={this.props.onViewThread}
						paginate={!!this.props.userAccount}
						posts={this.state.posts}
						userAccount={this.props.userAccount}
					/>
				);
		}
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
		// reload the profile if the profile user has changed or the user has signed in or out
		if (
			this.props.userName !== prevProps.userName ||
			(
				this.props.userAccount ?
					!prevProps.userAccount || prevProps.userAccount.id !== this.props.userAccount.id :
					!!prevProps.userAccount
			)
		) {
			this.setState(
				{
					view: View.Indeterminate,
					isFollowingButtonBusy: false
				},
				() => {
					this.props.onReloadProfile(this.props.screenId, this.props.userName, this.props.userAccount);
				}
			);
		}
		// set the view when the profile has loaded
		if (this.props.profile.value && prevProps.profile.isLoading) {
			if (
				this.props.profile.value.authorProfile &&
				!this.props.highlightedCommentId &&
				!this.props.highlightedPostId
			) {
				this.setState({
					view: View.Articles,
					isFollowingButtonBusy: this.state.isFollowingButtonBusy,
					articles: this.fetchArticles()
				});
			} else {
				this.setState({
					view: View.Posts,
					isFollowingButtonBusy: this.state.isFollowingButtonBusy,
					posts: this.fetchPosts(1)
				});
			}
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
		let isListLoading: boolean;
		switch (this.state.view) {
			case View.Articles:
				isListLoading = this.state.articles.isLoading;
				break;
			case View.Indeterminate:
				isListLoading = true;
				break;
			case View.Posts:
				isListLoading = this.state.posts.isLoading;
				break;
		}
		return (
			<div className="profile-screen_1u1j1e">
				{this.props.profile.isLoading ?
					<LoadingOverlay position="absolute" /> :
					!this.props.profile.value ?
						<InfoBox
							position="absolute"
							style="normal"
						>
							<p>Profile not found.</p>
						</InfoBox> :
						<>
							{!this.props.userAccount ?
								<Panel className="header">
									<h1>Join Readup to read with @{this.props.profile.value.userName}.</h1>
									<h3>
										<GetStartedButton
											analyticsAction="ProfileScreenCreateAccount"
											deviceType={this.props.deviceType}
											location={this.props.location}
											onBeginOnboarding={this.props.onBeginOnboarding}
											onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
											onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
											onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
										/>
									</h3>
								</Panel> :
								null}
							<Panel className="main">
								<div className="profile" data-nosnippet>
									{this.props.profile.value.authorProfile ?
										<div className="author">
											{this.props.profile.value.authorProfile.name}<Icon name="verified-user" title="Verified" />
										</div> :
										null}
									<div className={classNames('user-name', { 'small': !!this.props.profile.value.authorProfile })}>
										<span className="name">@{this.props.profile.value.userName}</span>
										{this.props.profile.value.leaderboardBadge !== LeaderboardBadge.None ?
											<LeaderboardBadges badge={this.props.profile.value.leaderboardBadge} /> :
											null}
									</div>
									{this.props.profile.value.authorProfile ?
										<div className="earnings">
											Total Readup earnings: {formatCurrency(this.props.profile.value.authorProfile.totalEarnings)}
										</div> :
										null}
									{isOwnProfile ?
										<>
											{this.props.profile.value.followeeCount ?
												<Link
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
										<Link
											badge={isOwnProfile && this.props.userAccount.followerAlertCount}
											className="following-count"
											onClick={this._showFollowers}
											text={followersText}
										/> :
										<span className="following-count">{followersText}</span>}
								</div>
								{this.props.profile.value.authorProfile ?
									<div className="controls" data-nosnippet>
										<HeaderSelector
											disabled={isListLoading}
											items={headerSelectorItems}
											onChange={this._changeView}
											style="compact"
											value={this.state.view}
										/>
									</div> :
									null}
								{this.renderList()}
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