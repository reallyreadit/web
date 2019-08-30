import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App, { Props } from './components/App';
import IframeMessagingContext from './IframeMessagingContext';
import CommentThread from '../../../common/models/CommentThread';
import { mergeComment } from '../../../common/comments';
import UserArticle from '../../../common/models/UserArticle';
import PostForm from '../../../common/models/social/PostForm';
import Post, { createCommentThread } from '../../../common/models/social/Post';

const contentScript = new IframeMessagingContext(
	window.parent,
	decodeURIComponent(window.location.hash.substr(1))
);
contentScript.addListener(message => {
	switch (message.type) {
		case 'commentPosted':
			if (props.comments && !props.comments.isLoading) {
				render(
					props = {
						...props,
						comments: {
							...props.comments,
							value: mergeComment(message.data, props.comments.value)
						}
					},
					setIframeHeight
				);
			}
			break;
		case 'pushState':
			// set height after rendering if new components will be added
			let callback: (() => void);
			if (
				(!props.article && message.data.article) ||
				(!props.comments && message.data.comments) ||
				(
					props.comments &&
					message.data.comments &&
					props.comments.isLoading !== message.data.comments.isLoading
				)
			) {
				callback = setIframeHeight;
			}
			// render
			render(
				props = {
					...props,
					...message.data
				},
				callback
			);
			break;
	}
});

function setIframeHeight() {
	contentScript.sendMessage({
		type: 'setHeight',
		data: document.body.clientHeight
	});
}

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
						render(
							props = {
								...props,
								article: post.article,
								comments: {
									...props.comments,
									value: mergeComment(
										createCommentThread(post),
										props.comments.value
									)
								}
							},
							setIframeHeight
						);
					} else {
						render(
							props = {
								...props,
								article: post.article
							}
						);
					}
					resolve(post);
				}
			);
		}
	);
}

function postComment(text: string, articleId: number, parentCommentId?: string) {
	return new Promise<void>(resolve => {
		contentScript.sendMessage(
			{
				type: 'postComment',
				data: { text, articleId, parentCommentId }
			},
			(result: { article: UserArticle, comment: CommentThread }) => {
				render(
					props = {
						...props,
						article: result.article,
						comments: {
							...props.comments,
							value: mergeComment(result.comment, props.comments.value)
						}
					},
					setIframeHeight
				);
				resolve();
			}
		);
	});
}

const root = document.getElementById('root');

let props: Props = {
	onPostArticle: postArticle,
	onPostComment: postComment
};

function render(props: Props, callback?: () => void) {
	ReactDOM.render(
		React.createElement(App, props),
		root,
		callback
	);
}

render(props);