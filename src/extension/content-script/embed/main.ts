import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App, { Props } from './components/App';
import IframeMessagingContext from './IframeMessagingContext';
import Rating from '../../../common/models/Rating';
import CommentThread from '../../../common/models/CommentThread';
import { mergeComment } from '../../../common/comments';

const contentScript = new IframeMessagingContext(
	window.parent,
	decodeURIComponent(window.location.hash.substr(1))
);
contentScript.addListener(message => {
	if (message.type === 'pushState') {
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
	}
});

function setIframeHeight() {
	contentScript.sendMessage({
		type: 'setHeight',
		data: document.body.clientHeight
	});
}

function postComment(text: string, articleId: number, parentCommentId?: string) {
	return new Promise<void>(resolve => {
		contentScript.sendMessage(
			{
				type: 'postComment',
				data: { text, articleId, parentCommentId }
			},
			(comment: CommentThread) => {
				render(
					props = {
						...props,
						comments: {
							...props.comments,
							value: mergeComment(comment, props.comments.value)
						}
					},
					setIframeHeight
				);
				resolve();
			}
		);
	});
}

function rateArticle(rating: number) {
	return new Promise(resolve => {
		contentScript.sendMessage(
			{
				type: 'rateArticle',
				data: rating
			},
			(rating: Rating) => {
				render(
					props = {
						...props,
						article: {
							...props.article,
							ratingScore: rating.score
						}
					}
				);
				resolve();
			}
		);
	});
}

const root = document.getElementById('root');

let props: Props = {
	onPostComment: postComment,
	onSelectRating: rateArticle
};

function render(props: Props, callback?: () => void) {
	ReactDOM.render(
		React.createElement(App, props),
		root,
		callback
	);
}

render(props);