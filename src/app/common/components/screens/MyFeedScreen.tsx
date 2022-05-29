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
import { SharedState, Screen } from '../Root';
import UserAccount, { hasAnyAlerts } from '../../../../common/models/UserAccount';
import Post from '../../../../common/models/social/Post';
import PageResult from '../../../../common/models/PageResult';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import Rating from '../../../../common/models/Rating';
import CommentThread from '../../../../common/models/CommentThread';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
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
import AbstractFollowable, {noop, reloadProfile, updateProfile} from '../AbstractFollowable';
import UserNameForm from '../../../../common/models/social/UserNameForm';
import Following from '../../../../common/models/social/Following';
import UserNameQuery from '../../../../common/models/social/UserNameQuery';
import Profile from '../../../../common/models/social/Profile';
import Link from '../../../../common/components/Link';
import FolloweeCountChange from '../../../../common/models/social/FolloweeCountChange';

interface Props {
	deviceType: DeviceType,
	onClearAlerts: (alert: Alert) => void,
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onFollowUser: (form: UserNameForm) => Promise<void>,
	onGetFollowees: FetchFunction<Following[]>,
	onGetFollowers: FetchFunctionWithParams<UserNameQuery, Following[]>,
	onGetNotificationPosts: FetchFunctionWithParams<NotificationPostsQuery, PageResult<Post>>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onReloadProfile: (screenId: number, userName: string, user: UserAccount | null) => Promise<Profile>,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterFolloweeCountChangedHandler: (handler: (change: FolloweeCountChange) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onUnfollowUser: (form: UserNameForm) => Promise<void>,
	onUpdateProfile: (screenId: number, newValues: Partial<Profile>) => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	profile: Fetchable<Profile>,
	screenId: number,
	userAccount: UserAccount | null,
	userName: string
}
interface State {
	isLoadingNewItems: boolean,
	isScreenLoading: boolean,
	newItemCount: number,
	posts: Fetchable<PageResult<Post>>,

}

const postAlerts = Alert.Post | Alert.Loopback;
class MyFeedScreen extends AbstractFollowable<Props, State> {
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
		if (!this._hasClearedAlert && hasAnyAlerts(this.props.userAccount, postAlerts)) {
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
		super.componentDidUpdate(prevProps);
		if (this.props.userAccount && prevProps.userAccount) {
			const newItemCount = Math.max(
				0,
				(this.props.userAccount.postAlertCount - prevProps.userAccount.postAlertCount) +
				(this.props.userAccount.loopbackAlertCount - prevProps.userAccount.loopbackAlertCount)
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
						{
						this.props.profile.isLoading ?
							<LoadingOverlay position="static" /> :
						<div className="followings">
							{this.props.profile.value.followeeCount ?
								<Link
									className="following-count"
									onClick={this._showFollowees}
									text={this._getFolloweesText()}
								/> :
								<div className="following-count">{this._getFolloweesText()}</div>}
							{" "}|{" "}
							{this.props.profile.value.followerCount ?
										<Link
											badge={this.isOwnProfile() && this.props.userAccount.followerAlertCount}
											className="following-count"
											onClick={this._showFollowers}
											text={this._getFollowersText()}
										/> :
										<div className="following-count">{this._getFollowersText()}</div>}
						</div>
						}
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
														user={this.props.userAccount}
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
										<span>Their posts will appear here, as well as posts from people who commented on articles that you read.</span>
									</StickyNote>
								</CenteringContainer>}
						</>}
			</ScreenContainer>
		);
	}
}
type Deps = Pick<Props, Exclude<keyof Props, 'location'
	| 'onCopyAppReferrerTextToClipboard'
	| 'onOpenNewPlatformNotificationRequestDialog'
	| 'onReloadProfile'
	| 'onUpdateProfile'
	| 'profile'
	| 'screenId'
 	| 'onBeginOnboarding'
	| 'userAccount'
	| 'userName'
	>>;

const createNewScreenState = (result: Fetchable<Profile>, user: UserAccount | null) => produce(
	(currentState: Screen<Fetchable<Profile>>) => {
		currentState.componentState = result;
	}
);

export default function createMyFeedScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Deps & {
		onGetProfile: FetchFunctionWithParams<UserNameQuery, Profile>,
		onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void
	}
) {
	const factoryHelperDeps = {
		...deps,
		createNewScreenState: createNewScreenState
	};
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => {
			const profile = deps.onGetProfile(
				{
					userName: sharedState.user.name
				},
				result => {
					deps.onSetScreenState(id, createNewScreenState(result, sharedState.user));
				}
			);
			return {
				id,
				componentState: profile,
				key,
				location,
				title: 'My Feed' }
		},
		render: (screen: Screen, sharedState: SharedState) => {
			return (<MyFeedScreen {
				...{
					...deps,
					location: screen.location,
					onBeginOnboarding: noop,
					onCopyAppReferrerTextToClipboard: noop,
					onOpenNewPlatformNotificationRequestDialog: noop,
					onReloadProfile: reloadProfile.bind(null, factoryHelperDeps),
					onUpdateProfile: updateProfile.bind(null, factoryHelperDeps),
					profile: screen.componentState,
					screenId: screen.id,
					userAccount: sharedState.user,
					userName: sharedState.user.name,
				}} />);
		}
	}
}