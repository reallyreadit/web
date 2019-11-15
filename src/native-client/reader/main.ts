import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import Page from '../../common/reading/Page';
import ContentElement from '../../common/reading/ContentElement';
import createPageParseResult from '../../common/reading/createPageParseResult';
import Reader from '../../common/reading/Reader';
import * as ReactDOM from 'react-dom';
import * as  React from 'react';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import ShareData from '../../common/sharing/ShareData';
import CommentThread from '../../common/models/CommentThread';
import { mergeComment } from '../../common/comments';
import BookmarkPrompt from './components/BookmarkPrompt';
import parseDocumentContent from '../../common/contentParsing/parseDocumentContent';
import styleArticleDocument from '../../common/reading/styleArticleDocument';
import pruneDocument from '../../common/contentParsing/pruneDocument';
import procesLazyImages from '../../common/contentParsing/processLazyImages';
import { findPublisherConfig } from '../../common/contentParsing/configuration/PublisherConfig';
import configs from '../../common/contentParsing/configuration/configs';
import App, { Props as EmbedProps } from './components/App';
import PostForm from '../../common/models/social/PostForm';
import Post, { createCommentThread } from '../../common/models/social/Post';

const messagingContext = new WebViewMessagingContext();

window.reallyreadit = {
	nativeClient: {
		reader: messagingContext.createIncomingMessageHandlers()
	}
};

let lookupResult: ArticleLookupResult;

const
	metadataParseResult = parseDocumentMetadata(),
	contentParseResult = parseDocumentContent(),
	page = new Page(
		contentParseResult.primaryTextContainers.map(container => new ContentElement(container.containerElement as HTMLElement, container.wordCount))
	);

pruneDocument(contentParseResult);
styleArticleDocument(
	window.document,
	metadataParseResult.metadata.article.title,
	metadataParseResult.metadata.article.authors
		.map(author => author.name)
		.filter(name => name ? !!name.trim() : false)
		.join(', ')
);

const publisherConfig = findPublisherConfig(configs.publishers, window.location.hostname);
procesLazyImages(publisherConfig && publisherConfig.imageStrategy);

const reader = new Reader(
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
				// migrate deprecated article property if required due to an outdated app
				if (!article.datesPosted) {
					article.datesPosted = [];
					if ((article as any).datePosted) {
						article.datesPosted.push((article as any).datePosted);
					}
				}
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

// bookmark prompt
function insertBookmarkPrompt() {
	// create root element
	const rootElement = window.document.createElement('div');
	rootElement.addEventListener(
		'animationend',
		event => {
			if (event.animationName === 'bookmark-prompt_3dkh9o-pop-out') {
				rootElement.remove();
			}
		}
	);
	window.document.body.append(rootElement);
	// props helper
	function beginClosingPrompt() {
		ReactDOM.render(
			React.createElement(
				BookmarkPrompt,
				props = {
					...props,
					isClosing: true
				}
			),
			rootElement
		);
	}
	// initial render
	let props = {
		isClosing: false,
		onCancel: beginClosingPrompt,
		onConfirm: () => {
			const scrollTop = page.getBookmarkScrollTop();
			if (scrollTop > window.innerHeight) {
				const content = document.getElementById('com_readup_article_content');
				content.style.opacity = '0';
				setTimeout(
					() => {
						window.scrollTo(0, scrollTop);
						content.style.opacity = '1';
					},
					350
				);
			}
			beginClosingPrompt();
		}
	};
	ReactDOM.render(
		React.createElement(BookmarkPrompt, props),
		rootElement
	);
}

// embed
let
	embedProps: Partial<EmbedProps> = {
		onPostArticle: postArticle,
		onPostComment: postComment,
		onShare: share
	},
	embedRootElement: HTMLDivElement;
function insertEmbed() {
	// create root element
	embedRootElement = window.document.createElement('div');
	embedRootElement.id = 'com_readup_embed';
	window.document.body.append(embedRootElement);
	// initial render
	messagingContext.sendMessage(
		{
			type: 'getComments',
			data: lookupResult.userArticle.slug
		},
		(comments: CommentThread[]) => {
			render({
				comments: {
					...embedProps.comments,
					value: comments
				}
			});
		}
	);
	render({
		article: lookupResult.userArticle,
		comments: { isLoading: true },
		user: lookupResult.user
	});
}
function render(props: Partial<EmbedProps>) {
	ReactDOM.render(
		React.createElement(
			App,
			embedProps = {
				...embedProps,
				...props
			} as EmbedProps
		),
		embedRootElement
	);
}

function postArticle(form: PostForm) {
	return new Promise<Post>(
		resolve => {
			messagingContext.sendMessage(
				{
					type: 'postArticle',
					data: form
				},
				(post: Post) => {
					// migrate deprecated article property if required due to an outdated app
					if (!post.article.datesPosted) {
						post.article.datesPosted = [];
						if ((post.article as any).datePosted) {
							post.article.datesPosted.push((post.article as any).datePosted);
						}
					}
					if (post.comment) {
						render({
							article: post.article,
							comments: {
								...embedProps.comments,
								value: mergeComment(
									createCommentThread(post),
									embedProps.comments.value
								)
							}
						});
					} else {
						render({ article: post.article });
					}
					resolve(post);
				}
			);
		}
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
						...embedProps.comments,
						value: mergeComment(result.comment, embedProps.comments.value)
					}
				});
			}
		);
	});
}

function share(data: ShareData) {
	messagingContext.sendMessage({
		type: 'share',
		data
	});
}

messagingContext.sendMessage(
	{
		type: 'parseResult',
		data: createPageParseResult(metadataParseResult, contentParseResult)
	},
	(result: ArticleLookupResult) => {
		// migrate deprecated article property if required due to an outdated app
		if (!result.userArticle.datesPosted) {
			result.userArticle.datesPosted = [];
			if ((result.userArticle as any).datePosted) {
				result.userArticle.datesPosted.push((result.userArticle as any).datePosted);
			}
		}
		lookupResult = result;
		page.setReadState(result.userPage.readState);
		reader.loadPage(page);
		if (result.userArticle.isRead) {
			insertEmbed();
		} else if (page.getBookmarkScrollTop() > window.innerHeight) {
			insertBookmarkPrompt();
		}
	}
);