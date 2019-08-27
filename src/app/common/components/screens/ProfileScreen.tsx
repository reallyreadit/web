import * as React from 'react';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import UserAccount from '../../../../common/models/UserAccount';
import { FetchFunctionWithParams, FetchFunction } from '../../serverApi/ServerApi';
import UserNameQuery from '../../../../common/models/social/UserNameQuery';
import Profile from '../../../../common/models/social/Profile';
import PostsQuery from '../../../../common/models/social/PostsQuery';
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
import { Screen, SharedState } from '../Root';
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
import FollowingListDialog from './ProfileScreen/FollowingListDialog';
import produce from 'immer';

const route = findRouteByKey(routes, ScreenKey.Profile);
interface Props {
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onFollowUser: (form: UserNameForm) => Promise<void>,
	onGetFollowees: FetchFunction<Following[]>,
	onGetFollowers: FetchFunctionWithParams<UserNameQuery, Following[]>,
	onGetPosts: FetchFunctionWithParams<PostsQuery, PageResult<Post>>,
	onGetProfile: FetchFunctionWithParams<UserNameQuery, Profile>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostArticle: (article: UserArticle) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterArticlePostedHandler: (handler: (post: Post) => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onUnfollowUser: (form: UserNameForm) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewThread: (comment: CommentThread) => void,
	userAccount: UserAccount | null,
	userName: string
}
export type Deps = Pick<Props, Exclude<keyof Props, 'userAccount' | 'userName'>>;
interface State {
	profile: Fetchable<Profile>,
	posts: Fetchable<PageResult<Post>>
}
const postsPageSize = 40;
export class ProfileScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _followUser = (form: UserNameForm) => {
		return this.props
			.onFollowUser(form)
			.then(
				() => {
					if (this.isOwnProfile()) {
						this.setState(
							produce(
								(state: State) => {
									state.profile.value.followeeCount++;
								}
							)
						);
					} else {
						this.setState(
							produce(
								(state: State) => {
									state.profile.value.isFollowed = true;
									state.profile.value.followerCount++;
								}
							)
						);
					}
				}
			);
	};
	private readonly _openGetFollowersDialog = () => {
		this.props.onOpenDialog(
			<GetFollowersDialog
				onCloseDialog={this.props.onCloseDialog}
				onCopyTextToClipboard={this.props.onCopyTextToClipboard}
				onShare={this.props.onShare}
				userName={this.props.userAccount.name}
			/>
		);
	};
	private readonly _showFollowees = () => {
		this.props.onOpenDialog(
			<FollowingListDialog
				onCloseDialog={this.props.onCloseDialog}
				onFollowUser={this._followUser}
				onGetFollowings={this.props.onGetFollowees}
				onUnfollowUser={this._unfollowUser}
				title="Following"
				userAccount={this.props.userAccount}
			/>
		);
	};
	private readonly _showFollowers = () => {
		this.props.onOpenDialog(
			<FollowingListDialog
				onCloseDialog={this.props.onCloseDialog}
				onFollowUser={this._followUser}
				onGetFollowings={
					(callback: (value: Fetchable<Following[]>) => void) => this.props.onGetFollowers({ userName: this.props.userName }, callback)
				}
				onUnfollowUser={this._unfollowUser}
				title={
					this.isOwnProfile() ?
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
					if (this.isOwnProfile()) {
						this.setState(
							produce(
								(state: State) => {
									state.profile.value.followeeCount--;
								}
							)
						);
					} else {
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
									posts.splice(
										index,
										1,
										{
											...post,
											article: event.article
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
	}
	private fetchProfile() {
		return this.props.onGetProfile(
			{ userName: this.props.userName },
			this._asyncTracker.addCallback(
				profile => {
					this.setState({ profile });
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
	public componentDidUpdate(prevProps: Props) {
		if (
			this.props.userName !== prevProps.userName ||
			(
				this.props.userAccount ?
					!prevProps.userAccount || prevProps.userAccount.id !== this.props.userAccount.id :
					!!prevProps.userAccount
			)
		) {
			this.setState({
				profile: this.fetchProfile(),
				posts: this.fetchPosts(1)
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
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
								<LeaderboardBadges badge={this.state.profile.value.leaderboardBadge} />
							</div>
							{this.isOwnProfile() ?
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
									onFollow={this._followUser}
									onUnfollow={this._unfollowUser}
									size="large"
								/>}
							{this.state.profile.value.followerCount ?
								<ActionLink
									className="following-count followers"
									onClick={this._showFollowers}
									text={followersText}
								/> :
								<span className="following-count followers">{followersText}</span>}
						</div>
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
											user={this.props.userAccount}
										/>
									</li>
								)
							)}
						</ArticleList>
					</>}
			</ScreenContainer>
		)
	}
}
export function getProps(deps: Deps, state: Screen, sharedState: SharedState) {
	return {
		...deps,
		userAccount: sharedState.user,
		userName: route.getPathParams(state.location.path)['userName']
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