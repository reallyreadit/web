import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import parseDocumentContent from '../../common/reading/parseDocumentContent';
import Page from '../../common/reading/Page';
import ContentElement from '../../common/reading/ContentElement';
import createPageParseResult from '../../common/reading/createPageParseResult';
import Reader from '../../common/reading/Reader';
import * as ReactDOM from 'react-dom';
import * as  React from 'react';
import Footer, { Props as FooterProps } from '../../common/components/reader/Footer';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import Rating from '../../common/models/Rating';
import UserArticle from '../../common/models/UserArticle';
import ShareData from '../../common/sharing/ShareData';
import ShareChannel from '../../common/sharing/ShareChannel';
import { createUrl } from '../../common/HttpEndpoint';
import CommentThread from '../../common/models/CommentThread';
import { mergeComment } from '../../common/comments';

const messagingContext = new WebViewMessagingContext();

window.reallyreadit = {
	nativeClient: {
		reader: messagingContext.createIncomingMessageHandlers()
	}
};

function copyTextToClipboard() {
	// we don't need this since we're using native sharing
}
function createAbsoluteUrl(path: string) {
	return createUrl(window.reallyreadit.nativeClient.reader.config.webServer, path);
}
function share(data: ShareData) {
	messagingContext.sendMessage({
		type: 'share',
		data
	});
	return [] as ShareChannel[];
}

let lookupResult: ArticleLookupResult;

const
	contentParseResult = parseDocumentContent('mutate'),
	page = new Page(
		contentParseResult.elements.map(el => new ContentElement(el.element, el.wordCount)),
		false
	),
	reader = new Reader(
		event => {
			messagingContext.sendMessage(
				{
					type: 'commitReadState',
					data: {
						commitData: {
							readState: event.readStateArray,
							userPageId: lookupResult.userPage.id
						},
						isCompletionCommit: event.isCompletionCommit
					}
				},
				(article: UserArticle) => {
					if (article.isRead) {
						if (embedRootElement) {
							render({ article });
						} else {
							insertEmbed();
						}
					}
				}
			)
		}
	);

// embed
let
	footerProps: Partial<FooterProps> = {
		onCopyTextToClipboard: copyTextToClipboard,
		onCreateAbsoluteUrl: createAbsoluteUrl,
		onPostComment: postComment,
		onSelectRating: rateArticle,
		onShare: share
	},
	embedRootElement: HTMLDivElement,
	hasLoadedComments = false;
function insertEmbed() {
	// create root element
	embedRootElement = window.document.createElement('div');
	embedRootElement.id = 'reallyreadit-footer-root';
	page.elements[page.elements.length - 1].element.insertAdjacentElement(
		'afterend',
		embedRootElement
	);
	// initial render
	const initialProps: Pick<FooterProps, 'article' | 'comments' | 'user'> = {
		article: lookupResult.userArticle,
		user: lookupResult.user
	};
	if (lookupResult.userArticle.ratingScore != null) {
		loadComments();
		initialProps.comments = { isLoading: true };
	}
	render(initialProps);
}
function loadComments() {
	messagingContext.sendMessage(
		{
			type: 'getComments',
			data: lookupResult.userArticle.slug
		},
		(comments: CommentThread[]) => {
			render({
				comments: {
					...footerProps.comments,
					value: comments
				}
			});
		}
	);
	hasLoadedComments = true;
}
function render(props: Partial<FooterProps>) {
	ReactDOM.render(
		React.createElement(
			Footer,
			footerProps = {
				...footerProps,
				...props
			} as FooterProps
		),
		embedRootElement
	);
}

function postComment(text: string, articleId: number, parentCommentId?: string) {
	return new Promise<void>(resolve => {
		messagingContext.sendMessage(
			{
				type: 'postComment',
				data: {
					articleId,
					parentCommentId,
					text
				}
			},
			(result: { article: UserArticle, comment: CommentThread }) => {
				resolve();
				render({
					article: result.article,
					comments: {
						...footerProps.comments,
						value: mergeComment(result.comment, footerProps.comments.value)
					}
				});
			}
		);
	});
}

function rateArticle(score: number) {
	return new Promise<{}>(resolve => {
		messagingContext.sendMessage(
			{
				type: 'rateArticle',
				data: {
					articleId: lookupResult.userArticle.id,
					score
				}
			},
			(result: { article: UserArticle, rating: Rating }) => {
				resolve();
				const newProps: Pick<FooterProps, 'article' | 'comments'> = {
					article: result.article
				};
				if (!hasLoadedComments) {
					loadComments();
					newProps.comments = { isLoading: true };
				}
				render(newProps);
			}
		);
	});
}

messagingContext.sendMessage(
	{
		type: 'parseResult',
		data: createPageParseResult(
			parseDocumentMetadata(),
			contentParseResult
		)
	},
	(result: ArticleLookupResult) => {
		lookupResult = result;
		page.setReadState(result.userPage.readState);
		reader.loadPage(page);
		if (result.userArticle.isRead) {
			insertEmbed();
		}
	}
);