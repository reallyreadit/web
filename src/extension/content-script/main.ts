import Page from '../../common/reading/Page';
import EventPageApi from './EventPageApi';
import { SourceRuleAction } from '../../common/models/SourceRule';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import ContentElement from '../../common/reading/ContentElement';
import Reader from '../../common/reading/Reader';
import createPageParseResult from '../../common/reading/createPageParseResult';
import UserArticle from '../../common/models/UserArticle';
import { calculateEstimatedReadTime } from '../../common/calculate';
import IframeMessagingContext from './embed/IframeMessagingContext';
import insertBookmarkPrompt from './insertBookmarkPrompt';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import ParseResult from '../../common/contentParsing/ParseResult';
import styleArticleDocument from '../../common/reading/styleArticleDocument';
import LazyScript from './LazyScript';

window.reallyreadit = {
	extension: {
		contentScript: {
			contentParser: new LazyScript(() => {
				eventPageApi.loadContentParser();
			})
		}
	}
};

const { contentParser } = window.reallyreadit.extension.contentScript;

let
	path = window.location.pathname,
	context: {
		contentParseResult: ParseResult,
		lookupResult: ArticleLookupResult,
		page: Page,
		isContentIdentificationDisplayEnabled: boolean
	} | null,
	initData: {
		sourceRules: {
			path: RegExp,
			priority: number,
			action: SourceRuleAction
		}[]
	};

// event page interface
let historyStateUpdatedTimeout: number;

const eventPageApi = new EventPageApi({
	onActivateReaderMode: () => {
		// transition animation
		document.body.style.transition = 'opacity 350ms';
		document.body.style.opacity = '0';
		document.body.classList.add('com_readup_activating_reader_mode');
		setTimeout(
			() => {
				contentParser
					.get()
					.then(parser => {
						// remove iframe since pruning destorys its state
						const isEmbedInserted = !!iframe;
						if (isEmbedInserted) {
							removeEmbed();
						}
						// prune and style
						parser.prune(context.contentParseResult);
						styleArticleDocument(document, context.lookupResult.userArticle.title, context.lookupResult.userArticle.authors.join(', '));
						// restore iframe
						if (isEmbedInserted) {
							insertEmbed(context.lookupResult.userArticle);
						}
						// transition animation
						document.body.style.opacity = '1';
						document.body.classList.remove('com_readup_activating_reader_mode');
					});
			},
			350
		);
	},
	onArticleUpdated: event => {
		if (context && context.lookupResult) {
			context.lookupResult.userArticle = event.article;
		}
		if (embed) {
			embed.sendMessage({
				type: 'pushState',
				data: {
					article: event.article
				}
			});
		}
	},
	onCommentPosted: comment => {
		if (embed) {
			embed.sendMessage({
				type: 'commentPosted',
				data: comment
			});
		}
	},
	onDeactivateReaderMode: () => {
		window.location.reload();
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
let iframe: HTMLIFrameElement;
let embed: IframeMessagingContext;
function insertEmbed(article: UserArticle) {
	// create iframe
	iframe = window.document.createElement('iframe');
	iframe.id = 'com_readup_embed'
	iframe.src = `chrome-extension://${window.reallyreadit.extension.config.extensionId}/content-script/embed/index.html#` + encodeURIComponent(window.location.protocol + '//' + window.location.host);
	iframe.style.width = '100%';
	iframe.style.minWidth = '320px';
	iframe.style.maxHeight = '150vh';
	iframe.style.border = 'none';
	iframe.style.padding = '50px 0';
	iframe.style.boxSizing = 'border-box';
	iframe.addEventListener('load', () => {
		eventPageApi
			.getComments(article.slug)
			.then(
				comments => {
					embed.sendMessage({
						type: 'pushState',
						data: {
							comments: {
								isLoading: false,
								value: comments
							}
						}
					});
				}
			);
		embed.sendMessage({
			type: 'pushState',
			data: {
				article,
				comments: { isLoading: true },
				user: context.lookupResult.user
			}
		});
	});
	context.page.elements[context.page.elements.length - 1].element.insertAdjacentElement(
		'afterend',
		iframe
	);
	// create messaging context
	embed = new IframeMessagingContext(
		iframe.contentWindow,
		'chrome-extension://' + window.reallyreadit.extension.config.extensionId
	);
	embed.addListener((message, sendResponse) => {
		switch (message.type) {
			case 'postArticle':
				eventPageApi
					.postArticle(message.data)
					.then(
						result => {
							context.lookupResult.userArticle = result.article;
							sendResponse(result);
						}
					);
				break;
			case 'postComment':
				eventPageApi
					.postComment(message.data)
					.then(result => {
						context.lookupResult.userArticle = result.article;
						sendResponse(result);
					});
				break;
			case 'setHeight':
				// add extra height to account for CommentComposer expanding textarea, post dialog and additional overflow
				iframe.style.height = (message.data + 265) + 'px';
				break;
		}
	});
}
function removeEmbed() {
	if (iframe) {
		iframe.remove();
		iframe = null;
	}
	if (embed) {
		embed.destruct();
		embed = null;
	}
}

function shouldShowEmbed(article: UserArticle) {
	return (
		article.isRead &&
		(calculateEstimatedReadTime(article.wordCount) > 2)
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
							embed.sendMessage({
								type: 'pushState',
								data:  { article }
							});
						} else if (shouldShowEmbed(article)) {
							insertEmbed(article);
						}
					}
				});
		}
	}
)

// page lifecycle
function loadPage() {
	unloadPage().then(() => {
		// check for matching source rules
		const rule = initData.sourceRules
			.filter(rule => rule.path.test(path))
			.sort((a, b) => b.priority - a.priority)[0];
		// proceed if we're not ignoring the page
		if (!rule || rule.action !== SourceRuleAction.Ignore) {
			const metaParseResult = parseDocumentMetadata();
			// proceed if we have a positive metadata result or if we're following a read rule
			if (
				(metaParseResult.isArticle && metaParseResult.metadata.url && metaParseResult.metadata.article.title) ||
				(rule && rule.action === SourceRuleAction.Read)
			) {
				contentParser
					.get()
					.then(parser => {
						const content = parser.parse();
						if (
							content.primaryTextContainers.length &&
							(metaParseResult.metadata.url && metaParseResult.metadata.article.title)
						) {
							const page = new Page(
								content.primaryTextContainers.map(container => new ContentElement(container.containerElement as HTMLElement, container.wordCount))
							);
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
									loadUserInterface();
								})
								.catch(() => {
									unloadPage();
								});
						}
					});
			}
		}
	});
}
function loadUserInterface() {
	if (context) {
		if (shouldShowEmbed(context.lookupResult.userArticle)) {
			insertEmbed(context.lookupResult.userArticle);
		} else if (
			!context.lookupResult.userArticle.isRead &&
			context.page.getBookmarkScrollTop() > 0
		) {
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
		}
	}
}
function unloadPage() {
	if (context) {
		if (iframe) {
			removeEmbed();
		}
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
	.then(serializedInitData => {
		// set initData
		initData = {
			...serializedInitData,
			sourceRules: serializedInitData.sourceRules.map(rule => ({ ...rule, path: new RegExp(rule.path) }))
		};
		// load page
		if (serializedInitData.loadPage) {
			loadPage();
		}
	});