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
import ScreenContainer from '../ScreenContainer';
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
import UserAccount, {
	hasAnyAlerts,
} from '../../../../common/models/UserAccount';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState } from '../Root';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import { DeviceType } from '../../../../common/DeviceType';
import { ShareChannelData } from '../../../../common/sharing/ShareData';

interface Props {
	deviceType: DeviceType;
	onClearAlerts: (alert: Alert) => void;
	onCloseDialog: () => void;
	onCreateAbsoluteUrl: (path: string) => string;
	onGetNotificationPosts: FetchFunctionWithParams<
		NotificationPostsQuery,
		PageResult<Post>
	>;
	onGetReplyPosts: FetchFunctionWithParams<ReplyPostsQuery, PageResult<Post>>;
	onNavTo: (url: string) => boolean;
	onOpenDialog: (dialog: React.ReactNode) => void;
	onPostArticle: (article: UserArticle) => void;
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>;
	onReadArticle: (
		article: UserArticle,
		e: React.MouseEvent<HTMLElement>
	) => void;
	onRegisterArticleChangeHandler: (
		handler: (event: ArticleUpdatedEvent) => void
	) => Function;
	onShare: (data: ShareEvent) => ShareResponse;
	onShareViaChannel: (data: ShareChannelData) => void;
	onToggleArticleStar: (article: UserArticle) => Promise<void>;
	onViewComments: (article: UserArticle) => void;
	onViewProfile: (userName: string) => void;
	onViewThread: (comment: CommentThread) => void;
	user: UserAccount;
}
interface State {
	isLoadingNewItems: boolean;
	isScreenLoading: boolean;
	newItemCount: number;
	replies: Fetchable<PageResult<Post>>;
}
class NotificationsScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePage = (pageNumber: number) => {
		this.setState({
			isLoadingNewItems: false,
			newItemCount: 0,
			replies: this.fetchReplies(pageNumber),
		});
	};
	private readonly _loadNewItems = () => {
		this.setState({
			isLoadingNewItems: true,
		});
		this.fetchReplies(1);
	};
	constructor(props: Props) {
		super(props);
		const replies = this.fetchReplies(1);
		this.state = {
			isLoadingNewItems: false,
			isScreenLoading: replies.isLoading,
			newItemCount: 0,
			replies: replies,
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler((event) => {
				if (
					this.state.replies.value &&
					this.state.replies.value.items.some(
						(post) => post.article.id === event.article.id
					)
				) {
					this.setState(
						produce((prevState: State) => {
							prevState.replies.value.items.forEach((post, index, posts) => {
								if (post.article.id === event.article.id) {
									// merge objects in case the new object is missing properties due to outdated iOS client
									post.article = {
										...post.article,
										...event.article,
										dateStarred: event.article.dateStarred,
									};
								}
							});
						})
					);
				}
			})
		);
	}
	private checkAlertState() {
		let alerts = Alert.Reply;
		if (hasAnyAlerts(this.props.user, alerts)) {
			this.props.onClearAlerts(alerts);
		}
	}

	private fetchReplies(pageNumber: number) {
		return this.props.onGetReplyPosts(
			{
				pageNumber,
			},
			this._asyncTracker.addCallback((posts) => {
				this.setState({
					isLoadingNewItems: false,
					isScreenLoading: false,
					replies: posts,
					newItemCount: 0,
				});
				this.checkAlertState();
			})
		);
	}
	private getUpdateBannerText() {
		return `Show ${this.state.newItemCount} new ${formatCountable(
			this.state.newItemCount,
			'reply',
			'replies'
		)}`;
	}

	public componentDidMount() {
		this.checkAlertState();
	}
	public componentDidUpdate(prevProps: Props) {
		let newItemCount = Math.max(
			0,
			this.props.user.replyAlertCount - prevProps.user.replyAlertCount
		);
		if (newItemCount) {
			this.setState({
				newItemCount,
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		if (this.state.isScreenLoading) {
			return (
				<LoadingOverlay />
			);
		}
		return (
			<ScreenContainer className="notifications-screen_qjaly4">
				{this.state.newItemCount ? (
					<UpdateBanner
						isBusy={this.state.isLoadingNewItems}
						onClick={this._loadNewItems}
						text={this.getUpdateBannerText()}
					/>
				) : null}
				{this.state.replies.isLoading ? (
					<LoadingOverlay />
				) : this.state.replies.value.items.length ? (
					<>
						<List>
							{this.state.replies.value.items.map((post) => (
								<li key={post.date}>
									<PostDetails
										deviceType={this.props.deviceType}
										isReply={true}
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
							))}
						</List>
						<PageSelector
							pageNumber={this.state.replies.value.pageNumber}
							pageCount={this.state.replies.value.pageCount}
							onChange={this._changePage}
						/>
					</>
				) : (
					<CenteringContainer>
						<StickyNote>
							<span>No replies found.</span>
						</StickyNote>
					</CenteringContainer>
				)}
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
			title: {
				default: 'Replies'
			},
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
		),
	};
}
