import Page from '../../common/reading/Page';
import EventPageApi from './EventPageApi';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import ContentElement from '../../common/reading/ContentElement';
import Reader from '../../common/reading/Reader';
import createPageParseResult from '../../common/reading/createPageParseResult';
import UserArticle from '../../common/models/UserArticle';
import insertBookmarkPrompt from './insertBookmarkPrompt';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import ParseResult from '../../common/contentParsing/ParseResult';
import styleArticleDocument from '../../common/reading/styleArticleDocument';
import LazyScript from './LazyScript';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { mergeComment, updateComment } from '../../common/comments';
import CommentThread from '../../common/models/CommentThread';
import App, { Props } from './components/App';
import PostForm from '../../common/models/social/PostForm';
import { createCommentThread } from '../../common/models/social/Post';
import CommentForm from '../../common/models/social/CommentForm';
import CommentAddendumForm from '../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../common/models/social/CommentDeletionForm';
import icons from '../../common/svg/icons';

window.reallyreadit = {
	readerContentScript: {
		contentParser: new LazyScript(
			() => {
				eventPageApi.loadContentParser();
			}
		)
	}
};

const { contentParser } = window.reallyreadit.readerContentScript;

let
	path = window.location.pathname,
	context: {
		contentParseResult: ParseResult,
		lookupResult: ArticleLookupResult,
		page: Page,
		isContentIdentificationDisplayEnabled: boolean
	} | null;

// event page interface
let historyStateUpdatedTimeout: number;

const eventPageApi = new EventPageApi({
	onArticleUpdated: event => {
		if (context && context.lookupResult) {
			context.lookupResult.userArticle = event.article;
		}
		embed?.pushState({
			article: event.article
		});
	},
	onCommentPosted: comment => {
		embed?.commentPosted(comment);
	},
	onCommentUpdated: comment => {
		embed?.commentUpdated(comment);
	},
	onLoadPage: loadPage,
	onUnloadPage: unloadPage,
	onToggleContentIdentificationDisplay: () => {
		if (context) {
			let styles: {
				primaryTextRootNodeBackgroundColor?: string,
				depthGroupWithMostWordsBackgroundColor?: string,
				primaryTextContainerBackgroundColor?: string,
				imageBorder?: string,
				imageCaptionBackgroundColor?: string,
				imageCreditBackgroundColor?: string,
				additionalTextBackgroundColor?: string
			};
			if (context.isContentIdentificationDisplayEnabled = !context.isContentIdentificationDisplayEnabled) {
				styles = {
					primaryTextRootNodeBackgroundColor: 'green',
					depthGroupWithMostWordsBackgroundColor: 'red',
					primaryTextContainerBackgroundColor: 'lime',
					imageBorder: '3px solid magenta',
					additionalTextBackgroundColor: 'yellow'
				};
			} else {
				styles = { };
			}
			(context.contentParseResult.primaryTextRootNode as HTMLElement).style.backgroundColor = styles.primaryTextRootNodeBackgroundColor || '';
			context.contentParseResult.depthGroupWithMostWords.members.forEach(
				member => {
					(member.containerElement as HTMLElement).style.backgroundColor = styles.depthGroupWithMostWordsBackgroundColor || ''
				}
			);
			context.contentParseResult.primaryTextContainerSearchResults.forEach(
				result => {
					(result.textContainer.containerElement as HTMLElement).style.backgroundColor = styles.primaryTextContainerBackgroundColor || '';
				}
			);
			context.contentParseResult.imageContainers.forEach(
				image => {
					(image.containerElement as HTMLElement).style.border = styles.imageBorder || '';
				}
			);
			context.contentParseResult.additionalPrimaryTextContainers.forEach(
				container => {
					(container.containerElement as HTMLElement).style.backgroundColor = styles.additionalTextBackgroundColor || '';
				}
			);
		}
	},
	onToggleReadStateDisplay: () => {
		if (context) {
			context.page.toggleReadStateDisplay();
		}
	},
	onHistoryStateUpdated: url => {
		// throttle updates
		window.clearTimeout(historyStateUpdatedTimeout);
		historyStateUpdatedTimeout = window.setTimeout(() => {
			const newPath = new URL(url).pathname;
			if (newPath !== path) {
				// TODO: gotta come up with a more robust way to detect page changes
				path = newPath;
				setTimeout(loadPage, 2000);
			}
		}, 250);
	}
});

// embed
let embed: {
	commentPosted: (comment: CommentThread) => void,
	commentUpdated: (comment: CommentThread) => void,
	pushState: (state: { article: UserArticle }) => void
};
function insertEmbed(article: UserArticle) {
	embed = {
		commentPosted: comment => {
			if (props.comments && !props.comments.isLoading) {
				render({
					comments: {
						...props.comments,
						value: mergeComment(comment, props.comments.value)
					}
				});
			}
		},
		commentUpdated: comment => {
			if (props.comments && !props.comments.isLoading) {
				render({
					comments: {
						...props.comments,
						value: updateComment(comment, props.comments.value)
					}
				});
			}
		},
		pushState: state => {
			render({
				...state
			});
		}
	};

	function postArticle(form: PostForm) {
		return eventPageApi
			.postArticle(form)
			.then(
				post => {
					context.lookupResult.userArticle = post.article;
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
					return post;
				}
			);
	}

	function postComment(form: CommentForm) {
		return eventPageApi
			.postComment(form)
			.then(result => {
				context.lookupResult.userArticle = result.article;
				render({
					article: result.article,
					comments: {
						...props.comments,
						value: mergeComment(result.comment, props.comments.value)
					}
				});
			});
	}

	function postCommentAddendum(form: CommentAddendumForm) {
		return eventPageApi
			.postCommentAddendum(form)
			.then(
				comment => {
					render({
						comments: {
							...props.comments,
							value: updateComment(comment, props.comments.value)
						}
					});
					return comment;
				}
			);
	}

	function postCommentRevision(form: CommentRevisionForm) {
		return eventPageApi
			.postCommentRevision(form)
			.then(
				comment => {
					render({
						comments: {
							...props.comments,
							value: updateComment(comment, props.comments.value)
						}
					});
					return comment;
				}
			);
	}

	function deleteComment(form: CommentDeletionForm) {
		return eventPageApi
			.deleteComment(form)
			.then(
				comment => {
					render({
						comments: {
							...props.comments,
							value: updateComment(comment, props.comments.value)
						}
					});
					return comment;
				}
			);
	}

	const iconsElement = document.createElement('div');
	iconsElement.innerHTML = icons;

	const componentStyleLink = document.createElement('link');
	componentStyleLink.rel = 'stylesheet';
	componentStyleLink.href = `chrome-extension://${window.reallyreadit.extension.config.extensionId}/content-script/bundle.css`;

	const reactRoot = document.createElement('div');

	const shadowRoot = context.page.elements[context.page.elements.length - 1].element
		.insertAdjacentElement(
			'afterend',
			document.createElement('div')
		)
		.attachShadow({
			mode: 'open'
		});

	// react compatibility hack (https://github.com/facebook/react/issues/9242)
	Object.defineProperty(reactRoot, 'ownerDocument', { value: shadowRoot });
	(shadowRoot as any).createElement = (...args: any[]) => (document as any).createElement(...args);
	(shadowRoot as any).createElementNS = (...args: any[]) => (document as any).createElementNS(...args);
	(shadowRoot as any).createTextNode = (...args: any[]) => (document as any).createTextNode(...args);

	shadowRoot.append(componentStyleLink);
	shadowRoot.append(iconsElement);
	shadowRoot.append(reactRoot);

	let props: Props;

	props = {
		...props,
		article,
		comments: {
			isLoading: true
		},
		user: context.lookupResult.user,
		onDeleteComment: deleteComment,
		onPostArticle: postArticle,
		onPostComment: postComment,
		onPostCommentAddendum: postCommentAddendum,
		onPostCommentRevision: postCommentRevision,
	};

	function render(nextProps: Partial<Props>) {
		ReactDOM.render(
			React.createElement(
				App,
				props = {
					...props,
					...nextProps
				}
			),
			reactRoot
		);
	}

	eventPageApi
		.getComments(article.slug)
		.then(
			comments => {
				render({
					comments: {
						isLoading: false,
						value: comments
					}
				});
			}
		);
}

// reader
const reader = new Reader(
	event => {
		if (context) {
			eventPageApi
				.commitReadState(
					{
						readState: event.readStateArray,
						userPageId: context.lookupResult.userPage.id
					},
					event.isCompletionCommit
				)
				.then(article => {
					if (article.isRead) {
						if (embed) {
							embed.pushState({
								article
							});
						} else {
							insertEmbed(article);
						}
					}
				});
		}
	}
)

// page lifecycle
function loadPage() {
	unloadPage()
		.then(
			() => {
				const metaParseResult = parseDocumentMetadata();
				contentParser
					.get()
					.then(
						parser => {
							// parse content
							const content = parser.parse();
							// create page
							const page = new Page(
								content.primaryTextContainers.map(container => new ContentElement(container.containerElement as HTMLElement, container.wordCount))
							);
							// prune and style
							parser.prune(content);
							styleArticleDocument(
								document,
								metaParseResult.metadata.article.title,
								metaParseResult.metadata.article.authors
									.map(
										author => author.name
									)
									.filter(
										name => !!name
									)
									.join(', ')
							);
							// transition animation
							document.body.style.opacity = '1';
							document.body.classList.remove('com_readup_activating_reader_mode');
							// get article
							eventPageApi
								.registerPage(createPageParseResult(metaParseResult, content))
								.then(lookupResult => {
									// set the context
									context = {
										contentParseResult: content,
										lookupResult,
										page,
										isContentIdentificationDisplayEnabled: false
									};
									page.setReadState(lookupResult.userPage.readState);
									reader.loadPage(page);
									// load the user interface
									insertEmbed(lookupResult.userArticle);
									// bookmark prompt
									if (
										!lookupResult.userArticle.isRead &&
										context.page.getBookmarkScrollTop() > window.innerHeight
									) {
										setTimeout(
											() => {
												insertBookmarkPrompt({
													onConfirm: () => {
														const bookmarkScrollTop = context.page.getBookmarkScrollTop();
														if (bookmarkScrollTop > 0) {
															window.scrollTo({
																behavior: 'smooth',
																top: bookmarkScrollTop
															});
														}
													}
												});
											},
											350
										);
									}
								})
								.catch(() => {
									unloadPage();
								});
						}
					);
			}
		);
}
function unloadPage() {
	if (context) {
		reader.unloadPage();
		context.page.remove();
		context = null;
		return eventPageApi.unregisterPage();
	}
	return Promise.resolve();
}

// event handlers
window.addEventListener(
	'unload',
	() => {
		eventPageApi.unregisterContentScript();
	}
);

// register content script
eventPageApi
	.registerContentScript(window.location)
	.then(
		() => {
			// transition animation
			document.body.style.transition = 'opacity 350ms';
			document.body.style.opacity = '0';
			document.body.classList.add('com_readup_activating_reader_mode');
			setTimeout(
				() => {
					loadPage();
				},
				350
			);
		}
	);