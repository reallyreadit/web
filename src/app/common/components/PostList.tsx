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
import List from './controls/List';
import Fetchable from '../../../common/Fetchable';
import PageResult from '../../../common/models/PageResult';
import Post from '../../../common/models/social/Post';
import PostDetails from '../../../common/components/PostDetails';
import PageSelector from './controls/PageSelector';
import UserArticle from '../../../common/models/UserArticle';
import Rating from '../../../common/models/Rating';
import ArticleUpdatedEvent from '../../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../../common/models/CommentThread';
import ShareResponse from '../../../common/sharing/ShareResponse';
import UserAccount from '../../../common/models/UserAccount';
import AsyncTracker from '../../../common/AsyncTracker';
import LoadingOverlay from './controls/LoadingOverlay';
import InfoBox from '../../../common/components/InfoBox';
import ShareData, { ShareChannelData } from '../../../common/sharing/ShareData';
import {DeviceType} from '../../../common/DeviceType';

interface Props {
	addNewPosts?: boolean,
	emptyListMessage: string,
	deviceType: DeviceType,
	highlightedCommentId: string | null,
	highlightedPostId: string | null,
	onChangePageNumber: (pageNumber: number) => void,
	onChangePosts: (posts: Fetchable<PageResult<Post>>) => void,
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterArticlePostedHandler: (handler: (post: Post) => void) => Function,
	onRegisterCommentUpdatedHandler: (handler: (comment: CommentThread) => void) => Function,
	onShare: (data: ShareData) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	paginate: boolean,
	posts: Fetchable<PageResult<Post>>,
	userAccount: UserAccount | null
}
export class PostList extends React.Component<Props> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (
						this.props.posts.value &&
						this.props.posts.value.items.some(post => post.article.id === event.article.id)
					) {
						const postItems = this.props.posts.value.items.slice();
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
												...event.article,
												dateStarred: event.article.dateStarred
											}
										}
									);
								}
							}
						);
						this.props.onChangePosts({
							...this.props.posts,
							value: {
								...this.props.posts.value,
								items: postItems
							}
						});
					}
				}
			),
			props.onRegisterArticlePostedHandler(
				post => {
					if (this.props.posts.value && this.props.addNewPosts) {
						this.props.onChangePosts({
							...this.props.posts,
							value: {
								...this.props.posts.value,
								items: [
									post,
									...this.props.posts.value.items.slice(
										0,
										this.props.posts.value.items.length < this.props.posts.value.pageSize ?
											this.props.posts.value.items.length :
											this.props.posts.value.pageSize - 1
									)
								]
							}
						});
					}
				}
			),
			props.onRegisterCommentUpdatedHandler(
				comment => {
					if (this.props.posts.value) {
						const post = this.props.posts.value.items.find(post => post.comment && post.comment.id === comment.id);
						if (post) {
							const items = this.props.posts.value.items.slice();
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
							this.props.onChangePosts({
								...this.props.posts,
								value: {
									...this.props.posts.value,
									items
								}
							});
						}
					}
				}
			)
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		if (this.props.posts.isLoading) {
			return (
				<LoadingOverlay position="static" />
			);
		}
		if (!this.props.posts.value || !this.props.posts.value.items.length) {
			return (
				<InfoBox
					position="static"
					style="normal"
				>
					{!this.props.posts.value ?
						'Error loading posts.' :
						this.props.emptyListMessage}
				</InfoBox>
			);
		}
		return (
			<div className="post-list_eij9bc">
				<List>
					{this.props.posts.value.items.map(
						post => (
							<li key={post.date}>
								<PostDetails
									deviceType={this.props.deviceType}
									highlightedCommentId={this.props.highlightedCommentId}
									highlightedPostId={this.props.highlightedPostId}
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
				{this.props.paginate ?
					<PageSelector
						pageNumber={this.props.posts.value.pageNumber}
						pageCount={this.props.posts.value.pageCount}
						onChange={this.props.onChangePageNumber}
					/> :
					null}
			</div>
		);
	}
}