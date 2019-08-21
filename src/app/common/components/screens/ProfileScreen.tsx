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

const route = findRouteByKey(routes, ScreenKey.Profile);
interface Props {
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onFollowUser: (form: UserNameForm) => Promise<void>,
	onGetFollowees: FetchFunction<string[]>,
	onGetFollowers: FetchFunctionWithParams<UserNameQuery, Following[]>,
	onGetPosts: FetchFunctionWithParams<PostsQuery, PageResult<Post>>,
	onGetProfile: FetchFunctionWithParams<UserNameQuery, Profile>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
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
export class ProfileScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _followUser = (form: UserNameForm) => {
		return this.props
			.onFollowUser(form)
			.then(
				() => {
					this.setState({
						profile: {
							...this.state.profile,
							value: {
								...this.state.profile.value,
								isFollowed: true,
								followerCount: this.state.profile.value.followerCount + 1
							}
						}
					});
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
	private readonly _showFollowers = () => {
		this.props.onGetFollowers(
			{ userName: this.state.profile.value.userName },
			result => {
				console.log(result.value.map(following => JSON.stringify(following)).join(','));
			}
		)
	};
	private readonly _unfollowUser = (form: UserNameForm) => {
		return this.props
			.onUnfollowUser(form)
			.then(
				() => {
					this.setState({
						profile: {
							...this.state.profile,
							value: {
								...this.state.profile.value,
								isFollowed: false,
								followerCount: this.state.profile.value.followerCount - 1
							}
						}
					});
				}
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			profile: this.fetchProfile(),
			posts: this.fetchPosts(1)
		};
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
				pageSize: 40
			},
			this._asyncTracker.addCallback(
				posts => {
					this.setState({ posts });
				}
			)
		);
	}
	public componentDidUpdate(prevProps: Props) {
		if (this.props.userName !== prevProps.userName) {
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
		let followersText;
		if (this.state.profile.value) {
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
							{this.props.userAccount && this.props.userAccount.name === this.props.userName ?
								<Button
									onClick={this._openGetFollowersDialog}
									text="Get Followers"
									style="loud"
									size="large"
								/> :
								<FollowButton
									following={this.state.profile.value}
									onFollow={this._followUser}
									onUnfollow={this._unfollowUser}
									size="large"
								/>}
							{this.state.profile.value.followerCount ?
								<ActionLink
									className="followers"
									onClick={this._showFollowers}
									text={followersText}
								/> :
								<span className="followers">{followersText}</span>}
						</div>
						<ArticleList>
							{this.state.posts.value.items.map(
								post => (
									<li key={post.date}>
										<PostDetails
											onCopyTextToClipboard={this.props.onCopyTextToClipboard}
											onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
											onRead={this.props.onReadArticle}
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