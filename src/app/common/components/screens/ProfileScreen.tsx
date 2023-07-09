// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import RouteLocation from '../../../../common/routing/RouteLocation';
import UserAccount from '../../../../common/models/UserAccount';
import {
	FetchFunctionWithParams,
	FetchFunction,
} from '../../serverApi/ServerApi';
import UserNameQuery from '../../../../common/models/social/UserNameQuery';
import Profile from '../../../../common/models/social/Profile';
import UserPostsQuery from '../../../../common/models/social/UserPostsQuery';
import PageResult from '../../../../common/models/PageResult';
import Post from '../../../../common/models/social/Post';
import Fetchable from '../../../../common/Fetchable';
import LoadingOverlay from '../controls/LoadingOverlay';
import LeaderboardBadges from '../../../../common/components/LeaderboardBadges';
import UserArticle from '../../../../common/models/UserArticle';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import CommentThread from '../../../../common/models/CommentThread';
import UserNameForm from '../../../../common/models/social/UserNameForm';
import Following from '../../../../common/models/social/Following';
import FollowButton from '../../../../common/components/FollowButton';
import LeaderboardBadge from '../../../../common/models/LeaderboardBadge';
import InfoBox from '../../../../common/components/InfoBox';
import Alert from '../../../../common/models/notifications/Alert';
import FolloweeCountChange from '../../../../common/models/social/FolloweeCountChange';
import Rating from '../../../../common/models/Rating';
import Panel from '../BrowserRoot/Panel';
import { ProfilePage } from 'schema-dts';
import { JsonLd } from 'react-schemaorg';
import { DeviceType } from '../../../../common/DeviceType';
import AuthorArticleQuery from '../../../../common/models/articles/AuthorArticleQuery';
import Icon from '../../../../common/components/Icon';
import * as classNames from 'classnames';
import { PostList } from '../PostList';
import HeaderSelector from '../HeaderSelector';
import { ArticleList } from '../ArticleList';
import { ShareChannelData } from '../../../../common/sharing/ShareData';
import AbstractFollowable from '../AbstractFollowable';

interface Props {
	deviceType: DeviceType;
	highlightedCommentId: string | null;
	highlightedPostId: string | null;
	location: RouteLocation;
	onBeginOnboarding: (analyticsAction: string) => void;
	onClearAlerts: (alert: Alert) => void;
	onCloseDialog: () => void;
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void;
	onCreateAbsoluteUrl: (path: string) => string;
	onCreateStaticContentUrl: (path: string) => string;
	onFollowUser: (form: UserNameForm) => Promise<void>;
	onGetAuthorArticles: FetchFunctionWithParams<
		AuthorArticleQuery,
		PageResult<UserArticle>
	>;
	onGetFollowees: FetchFunction<Following[]>;
	onGetFollowers: FetchFunctionWithParams<UserNameQuery, Following[]>;
	onGetPosts: FetchFunctionWithParams<UserPostsQuery, PageResult<Post>>;
	onReloadProfile: (
		screenId: number,
		userName: string,
		user: UserAccount | null
	) => Promise<Profile>;
	onUpdateProfile: (screenId: number, newValues: Partial<Profile>) => void;
	onNavTo: (url: string) => boolean;
	onOpenDialog: (dialog: React.ReactNode) => void;
	onOpenNewPlatformNotificationRequestDialog: () => void;
	onPostArticle: (article: UserArticle) => void;
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>;
	onReadArticle: (
		article: UserArticle,
		e: React.MouseEvent<HTMLElement>
	) => void;
	onRegisterArticleChangeHandler: (
		handler: (event: ArticleUpdatedEvent) => void
	) => Function;
	onRegisterArticlePostedHandler: (handler: (post: Post) => void) => Function;
	onRegisterCommentUpdatedHandler: (
		handler: (comment: CommentThread) => void
	) => Function;
	onRegisterFolloweeCountChangedHandler: (
		handler: (change: FolloweeCountChange) => void
	) => Function;
	onShare: (data: ShareEvent) => ShareResponse;
	onShareViaChannel: (data: ShareChannelData) => void;
	onToggleArticleStar: (article: UserArticle) => Promise<void>;
	onUnfollowUser: (form: UserNameForm) => Promise<void>;
	onViewComments: (article: UserArticle) => void;
	onViewProfile: (userName: string) => void;
	onViewThread: (comment: CommentThread) => void;
	profile: Fetchable<Profile>;
	screenId: number;
	userAccount: UserAccount | null;
	userName: string;
}
export type Deps = Pick<
	Props,
	Exclude<
		keyof Props,
		'highlightedCommentId' | 'highlightedPostId' | 'userAccount' | 'userName'
	>
>;
enum View {
	Articles = 'Articles',
	Indeterminate = 'Indeterminate',
	Posts = 'Posts',
}
type BaseState = {
	isFollowingButtonBusy: boolean;
};
type ArticlesState = BaseState & {
	view: View.Articles;
	articles: Fetchable<PageResult<UserArticle>>;
};
type IndeterminateState = BaseState & {
	view: View.Indeterminate;
};
type PostsState = BaseState & {
	view: View.Posts;
	posts: Fetchable<PageResult<Post>>;
};
type State = IndeterminateState | ArticlesState | PostsState;
const listPageSize = 40;
const headerSelectorItems = [
	{
		value: View.Posts,
	},
	{
		value: View.Articles,
	},
];

export class ProfileScreen extends AbstractFollowable<Props, State> {
	private readonly _changeArticles = (
		articles: Fetchable<PageResult<UserArticle>>
	) => {
		this.setState({
			view: View.Articles,
			isFollowingButtonBusy: this.state.isFollowingButtonBusy,
			articles,
		});
	};
	private readonly _changeArticlesPageNumber = (_: number) => {
		this.setState({
			view: View.Articles,
			isFollowingButtonBusy: this.state.isFollowingButtonBusy,
			articles: { isLoading: true },
		});
		this.fetchArticles();
	};
	private readonly _changePosts = (posts: Fetchable<PageResult<Post>>) => {
		this.setState({
			view: View.Posts,
			isFollowingButtonBusy: this.state.isFollowingButtonBusy,
			posts,
		});
	};
	private readonly _changePostsPageNumber = (pageNumber: number) => {
		this.setState({
			view: View.Posts,
			isFollowingButtonBusy: this.state.isFollowingButtonBusy,
			posts: { isLoading: true },
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
						isLoading: true,
					},
				});
				this.fetchArticles();
				break;
			case View.Posts:
				this.setState({
					view,
					isFollowingButtonBusy: this.state.isFollowingButtonBusy,
					posts: {
						isLoading: true,
					},
				});
				this.fetchPosts(1);
				break;
		}
	};
	constructor(props: Props) {
		super(props);
		if (props.profile.isLoading || !props.profile.value) {
			this.state = {
				view: View.Indeterminate,
				isFollowingButtonBusy: false,
			};
		} else {
			this.state = {
				view: View.Posts,
				isFollowingButtonBusy: false,
				posts: this.fetchPosts(1),
			};
		}
	}
	private fetchArticles() {
		return this.props.onGetAuthorArticles(
			{
				maxLength: null,
				minLength: null,
				pageNumber: 1,
				pageSize: listPageSize,
				slug: this.props.profile.value.authorProfile.slug,
			},
			this._asyncTracker.addCallback((articles) => {
				this.setState({
					view: View.Articles,
					isFollowingButtonBusy: this.state.isFollowingButtonBusy,
					articles,
				});
			})
		);
	}
	private fetchPosts(pageNumber: number) {
		return this.props.onGetPosts(
			{
				userName: this.props.userName,
				pageNumber,
				pageSize: listPageSize,
			},
			this._asyncTracker.addCallback((posts) => {
				this.setState({
					view: View.Posts,
					isFollowingButtonBusy: this.state.isFollowingButtonBusy,
					posts,
				});
			})
		);
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
						deviceType={this.props.deviceType}
						onChangeArticles={this._changeArticles}
						onChangePageNumber={this._changeArticlesPageNumber}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onNavTo={this.props.onNavTo}
						onPostArticle={this.props.onPostArticle}
						onRateArticle={this.props.onRateArticle}
						onReadArticle={this.props.onReadArticle}
						onRegisterArticleChangeHandler={
							this.props.onRegisterArticleChangeHandler
						}
						onShare={this.props.onShare}
						onShareViaChannel={this.props.onShareViaChannel}
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
						deviceType={this.props.deviceType}
						emptyListMessage={
							this.isOwnProfile()
								? "You haven't posted anything yet."
								: `${this.props.userName} hasn't posted anything yet.`
						}
						highlightedCommentId={this.props.highlightedCommentId}
						highlightedPostId={this.props.highlightedPostId}
						onChangePageNumber={this._changePostsPageNumber}
						onChangePosts={this._changePosts}
						onCloseDialog={this.props.onCloseDialog}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onNavTo={this.props.onNavTo}
						onOpenDialog={this.props.onOpenDialog}
						onPostArticle={this.props.onPostArticle}
						onRateArticle={this.props.onRateArticle}
						onReadArticle={this.props.onReadArticle}
						onRegisterArticleChangeHandler={
							this.props.onRegisterArticleChangeHandler
						}
						onRegisterArticlePostedHandler={
							this.props.onRegisterArticlePostedHandler
						}
						onRegisterCommentUpdatedHandler={
							this.props.onRegisterCommentUpdatedHandler
						}
						onShare={this.props.onShare}
						onShareViaChannel={this.props.onShareViaChannel}
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
	public componentDidUpdate(prevProps: Props) {
		// reload the profile if the profile user has changed or the user has signed in or out
		// overrides abstract method
		if (this._profileUserChangedOrUserChanged(prevProps)) {
			this.setState(
				{
					view: View.Indeterminate,
					isFollowingButtonBusy: false,
				},
				() => {
					this.props.onReloadProfile(
						this.props.screenId,
						this.props.userName,
						this.props.userAccount
					);
				}
			);
		}
		// set the view when the profile has loaded
		if (this.props.profile.value && prevProps.profile.isLoading) {
			this.setState({
				view: View.Posts,
				isFollowingButtonBusy: this.state.isFollowingButtonBusy,
				posts: this.fetchPosts(1),
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		if (this.props.profile.isLoading) {
			return (
				<LoadingOverlay />
			);
		}
		if (!this.props.profile.value) {
			return (
				<InfoBox position="absolute" style="normal">
					<p>Profile not found.</p>
				</InfoBox>
			);
		}
		const isOwnProfile = this.isOwnProfile();
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
				<Panel className="main">
					<div className="profile" data-nosnippet>
						{this.props.profile.value.authorProfile ? (
							<div className="author">
								{this.props.profile.value.authorProfile.name}
								<Icon name="verified-user" title="Verified" />
							</div>
						) : null}
						<div
							className={classNames('user-name', {
								small: !!this.props.profile.value.authorProfile,
							})}
						>
							<span className="name">
								@{this.props.profile.value.userName}
							</span>
							{this.props.profile.value.leaderboardBadge !==
							LeaderboardBadge.None ? (
								<LeaderboardBadges
									badge={this.props.profile.value.leaderboardBadge}
								/>
							) : null}
						</div>
						{!isOwnProfile && this.props.userAccount ? (
							<FollowButton
								following={this.props.profile.value}
								isBusy={this.state.isFollowingButtonBusy}
								onFollow={this._followUser}
								onUnfollow={this._unfollowUser}
								size="large"
							/>
						) : null}
					</div>
					{this.props.profile.value.authorProfile ? (
						<div className="controls" data-nosnippet>
							<HeaderSelector
								disabled={isListLoading}
								items={headerSelectorItems}
								onChange={this._changeView}
								style="compact"
								value={this.state.view}
							/>
						</div>
					) : null}
					{this.renderList()}
				</Panel>
				<JsonLd<ProfilePage>
					item={{
						'@context': 'https://schema.org',
						'@type': 'ProfilePage',
						description: `Join Readup to read with ${this.props.profile.value.userName}`,
						name: this.props.profile.value.userName,
					}}
				/>
			</div>
		);
	}
}
export function getPathParams(location: RouteLocation) {
	const pathParams = findRouteByKey(routes, ScreenKey.Profile).getPathParams(
		location.path
	);
	return {
		highlightedCommentId:
			pathParams['highlightedType'] === 'comment'
				? pathParams['highlightedId']
				: null,
		highlightedPostId:
			pathParams['highlightedType'] === 'post'
				? pathParams['highlightedId']
				: null,
		userName: pathParams['userName'],
	};
}
