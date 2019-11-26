import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App, { Props } from './components/App';
import IframeMessagingContext from './IframeMessagingContext';
import CommentThread from '../../../common/models/CommentThread';
import { mergeComment, updateComment } from '../../../common/comments';
import UserArticle from '../../../common/models/UserArticle';
import PostForm from '../../../common/models/social/PostForm';
import Post, { createCommentThread } from '../../../common/models/social/Post';
import CommentForm from '../../../common/models/social/CommentForm';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';

const contentScript = new IframeMessagingContext(
	window.parent,
	decodeURIComponent(window.location.hash.substr(1))
);
contentScript.addListener(message => {
	switch (message.type) {
		case 'commentPosted':
			if (props.comments && !props.comments.isLoading) {
				render({
					comments: {
						...props.comments,
						value: mergeComment(message.data, props.comments.value)
					}
				});
			}
			break;
		case 'commentUpdated':
			if (props.comments && !props.comments.isLoading) {
				render({
					comments: {
						...props.comments,
						value: updateComment(message.data, props.comments.value)
					}
				});
			}
			break;
		case 'pushState':
			render({
				...message.data
			});
			break;
	}
});

function postArticle(form: PostForm) {
	return new Promise<Post>(
		resolve => {
			contentScript.sendMessage(
				{
					type: 'postArticle',
					data: form
				},
				(post: Post) => {
					if (post.comment) {
						render({
							article: post.article,
							comments: {
								...props.comments,
								value: mergeComment(
									createCommentThread(post),
									props.comments.value
								)
							}
						});
					} else {
						render({
							article: post.article
						});
					}
					resolve(post);
				}
			);
		}
	);
}

function postComment(form: CommentForm) {
	return new Promise<void>(resolve => {
		contentScript.sendMessage(
			{
				type: 'postComment',
				data: form
			},
			(result: { article: UserArticle, comment: CommentThread }) => {
				render({
					article: result.article,
					comments: {
						...props.comments,
						value: mergeComment(result.comment, props.comments.value)
					}
				});
				resolve();
			}
		);
	});
}

function postCommentAddendum(form: CommentAddendumForm) {
	return new Promise<CommentThread>(
		resolve => {
			contentScript.sendMessage(
				{
					type: 'postCommentAddendum',
					data: form
				},
				(comment: CommentThread) => {
					render({
						comments: {
							...props.comments,
							value: updateComment(comment, props.comments.value)
						}
					});
					resolve(comment);
				}
			);
		}
	);
}

function postCommentRevision(form: CommentRevisionForm) {
	return new Promise<CommentThread>(
		resolve => {
			contentScript.sendMessage(
				{
					type: 'postCommentRevision',
					data: form
				},
				(comment: CommentThread) => {
					render({
						comments: {
							...props.comments,
							value: updateComment(comment, props.comments.value)
						}
					});
					resolve(comment);
				}
			);
		}
	);
}

function deleteComment(form: CommentDeletionForm) {
	return new Promise<CommentThread>(
		resolve => {
			contentScript.sendMessage(
				{
					type: 'deleteComment',
					data: form
				},
				(comment: CommentThread) => {
					render({
						comments: {
							...props.comments,
							value: updateComment(comment, props.comments.value)
						}
					});
					resolve(comment);
				}
			);
		}
	);
}

const root = document.getElementById('root');

let props: Props;

props = {
	...props,
	onDeleteComment: deleteComment,
	onPostArticle: postArticle,
	onPostComment: postComment,
	onPostCommentAddendum: postCommentAddendum,
	onPostCommentRevision: postCommentRevision,
};

function render(nextProps: Partial<Props>) {
	// cache the current height
	const bodyHeightBeforeRender = document.body.offsetHeight;
	// prevent the scrollbar from being shown if it is not currently visible
	// while the iframe height is animating to its new value
	if (bodyHeightBeforeRender <= window.innerHeight) {
		document.body.style.overflow = 'hidden';
	}
	ReactDOM.render(
		React.createElement(
			App,
			props = {
				...props,
				...nextProps
			}
		),
		root,
		() => {
			if (document.body.offsetHeight > bodyHeightBeforeRender) {
				contentScript.sendMessage({
					type: 'setHeight',
					data: document.body.offsetHeight + 275 // leave some room for expaning comment composers
				});
				setTimeout(
					() => {
						document.body.style.overflow = 'auto';
					},
					500 + 50
				);
			} else {
				document.body.style.overflow = 'auto';
			}
		}
	);
}