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
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import CommentsScreen, { getPathParams, Props as CommentScreenProps } from '../screens/CommentsScreen';
import { Screen, SharedState } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';
import CommentThread from '../../../../common/models/CommentThread';
import AsyncTracker from '../../../../common/AsyncTracker';
import { mergeComment, updateComment } from '../../../../common/comments';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import CommentForm from '../../../../common/models/social/CommentForm';
import { DeviceType } from '../../../../common/DeviceType';

function noop() { }
interface Props extends Pick<CommentScreenProps, Exclude<keyof CommentScreenProps, 'article' | 'comments' | 'deviceType' | 'onBeginOnboarding' | 'onCopyAppReferrerTextToClipboard' | 'onOpenNewPlatformNotificationRequestDialog' | 'onPostComment'>> {
	articleSlug: string,
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
	onGetComments: FetchFunctionWithParams<{ slug: string }, CommentThread[]>,
	onPostArticle: (article: UserArticle) => void,
	onPostComment: (form: CommentForm) => Promise<CommentThread>,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterCommentPostedHandler: (handler: (comment: CommentThread) => void) => Function,
	onRegisterCommentUpdatedHandler: (handler: (comment: CommentThread) => void) => Function
}
class AppCommentsScreen extends React.Component<
	Props,
	{
		article: Fetchable<UserArticle>,
		comments: Fetchable<CommentThread[]>
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _postComment = (form: CommentForm) => {
		return this.props
			.onPostComment(form)
			.then(() => { });
	};
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				if (this.state.article.value && this.state.article.value.id === event.article.id) {
					// merge objects in case the new object is missing properties due to outdated iOS client
					this.setState({
						article: {
							...this.state.article,
							value: {
								...this.state.article.value,
								...event.article,
								dateStarred: event.article.dateStarred
							}
						}
					});
				}
			}),
			props.onRegisterCommentPostedHandler(comment => {
				if (this.state.article.value && this.state.article.value.id === comment.articleId && this.state.comments.value) {
					this.setState({
						comments: {
							...this.state.comments,
							value: mergeComment(comment, this.state.comments.value.slice())
						}
					});
				}
			}),
			props.onRegisterCommentUpdatedHandler(comment => {
				if (this.state.article.value && this.state.article.value.id === comment.articleId && this.state.comments.value) {
					this.setState({
						comments: {
							...this.state.comments,
							value: updateComment(comment, this.state.comments.value.slice())
						}
					});
				}
			})
		);
		this.state = {
			article: this.props.onGetArticle(
				{ slug: this.props.articleSlug },
				this._asyncTracker.addCallback(article => {
					this.setState({ article });
				})
			),
			comments: this.props.onGetComments(
				{ slug: this.props.articleSlug },
				this._asyncTracker.addCallback(comments => {
					this.setState({ comments });
				})
			)
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<CommentsScreen
				{
					...{
						...this.props,
						...this.state,
						deviceType: DeviceType.Ios,
						onBeginOnboarding: noop,
						onCopyAppReferrerTextToClipboard: noop,
						onOpenNewPlatformNotificationRequestDialog: noop,
						onPostComment: this._postComment
					}
				}
			/>
		);
	}
}
type Dependencies = Pick<Props, Exclude<keyof Props, 'article' | 'articleSlug' | 'highlightedCommentId' | 'location' | 'user'>>;
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Comments'
		}),
		render: (state: Screen, sharedState: SharedState) => {
			const pathParams = getPathParams(state.location);
			return (
				<AppCommentsScreen
					{
						...{
							...deps,
							articleSlug: pathParams.slug,
							highlightedCommentId: pathParams.commentId,
							location: state.location,
							user: sharedState.user
						}
					}
				/>
			);
		}
	};
}