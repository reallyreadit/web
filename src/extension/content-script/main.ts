import Page from '../../common/reading/Page';
import EventPageApi from './EventPageApi';
import { SourceRuleAction } from '../../common/models/SourceRule';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import LazyScript from './LazyScript';
import ContentElement from '../../common/reading/ContentElement';
import { ParseMode } from '../../common/reading/parseDocumentContent';
import Reader from '../../common/reading/Reader';
import createPageParseResult from '../../common/reading/createPageParseResult';
import UserArticle from '../../common/models/UserArticle';
import { calculateEstimatedReadTime } from '../../common/calculate';
import IframeMessagingContext from './embed/IframeMessagingContext';
import { Props as EmbedProps } from './embed/components/App';
import UserAccount from '../../common/models/UserAccount';

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
	context: {
		articleId: number,
		page: Page,
		path: string,
		userPageId: number,
		user: UserAccount
	} | null,
	initData: {
		parseMode: ParseMode,
		showOverlay: boolean,
		sourceRules: {
			path: RegExp,
			priority: number,
			action: SourceRuleAction
		}[]
	};

// event page interface
let historyStateUpdatedTimeout: number;

const eventPageApi = new EventPageApi({
	onLoadPage: loadPage,
	onUnloadPage: unloadPage,
	onShowOverlay: value => {
		initData.showOverlay = value;
		if (context) {
			context.page.showOverlay(value);
		}
	},
	onHistoryStateUpdated: url => {
		// throttle updates
		window.clearTimeout(historyStateUpdatedTimeout);
		historyStateUpdatedTimeout = window.setTimeout(() => {
			const newPath = new URL(url).pathname;
			if (!context || newPath !== context.path) {
				// TODO: gotta come up with a more robust way to detect page changes
				setTimeout(loadPage, 2000);
			}
		}, 250);
	}
});

// embed
type EmbedState = Pick<EmbedProps, Exclude<keyof EmbedProps, 'onPostComment' | 'onSelectRating'>>
let iframe: HTMLIFrameElement;
let embed: IframeMessagingContext;
let hasLoadedComments = false;
function insertEmbed(article: UserArticle) {
	// create iframe
	iframe = window.document.createElement('iframe');
	iframe.src = `chrome-extension://${window.reallyreadit.extension.config.extensionId}/content-script/embed/index.html#` + encodeURIComponent(window.location.protocol + '//' + window.location.host);
	iframe.style.width = '100%';
	iframe.style.minWidth = '320px';
	iframe.style.height = '0';
	iframe.style.border = 'none';
	iframe.style.margin = '50px 0';
	iframe.addEventListener('load', () => {
		const state: EmbedState = {
			article,
			user: context.user
		};
		if (article.ratingScore != null) {
			loadComments(article.slug);
			state.comments = { isLoading: true };
		}
		embed.sendMessage({
			type: 'pushState',
			data: state
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
			case 'postComment':
				eventPageApi
					.postComment(message.data)
					.then(sendResponse);
				break;
			case 'rateArticle':
				eventPageApi
					.rateArticle(context.articleId, message.data)
					.then(rating => {
						if (!hasLoadedComments) {
							loadComments(article.slug);
							embed.sendMessage({
								type: 'pushState',
								data: {
									comments: { isLoading: true }
								}
							});
						}
						sendResponse(rating);
					});
				break;
			case 'setHeight':
				// add 160px to account for CommentComposer expanding textarea and additional overflow
				iframe.style.height = (message.data + 160) + 'px';
				break;
		}
	});
}
function loadComments(slug: string) {
	eventPageApi
		.getComments(slug)
		.then(comments => {
			embed.sendMessage({
				type: 'pushState',
				data: {
					comments: {
						isLoading: false,
						value: comments
					}
				}
			});
		});
	hasLoadedComments = true;
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
	hasLoadedComments = false;
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
						userPageId: context.userPageId
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
		const path = window.location.pathname;
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
						const content = parser.parse(initData.parseMode);
						if (
							content.elements.length &&
							(metaParseResult.metadata.url && metaParseResult.metadata.article.title)
						) {
							const page = new Page(
								content.elements.map(el => new ContentElement(el.element, el.wordCount)),
								initData.showOverlay
							);
							eventPageApi
								.registerPage(createPageParseResult(metaParseResult, content))
								.then(lookupResult => {
									context = { 
										articleId: lookupResult.userArticle.id,
										page,
										path,
										userPageId: lookupResult.userPage.id,
										user: lookupResult.user
									};
									page.setReadState(lookupResult.userPage.readState);
									reader.loadPage(page);
									if (shouldShowEmbed(lookupResult.userArticle)) {
										insertEmbed(lookupResult.userArticle);
									}
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