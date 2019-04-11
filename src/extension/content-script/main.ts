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
		userPageId: number
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

let iframe: HTMLIFrameElement;
let iframeMessagingContext: IframeMessagingContext;
function insertEmbed(onLoad: () => void) {
	iframe = window.document.createElement('iframe');
	iframe.src = `chrome-extension://${window.reallyreadit.extension.config.extensionId}/content-script/embed/index.html#` + encodeURIComponent(window.location.protocol + '//' + window.location.host);
	iframe.onload = function () {
		if (onLoad) {
			onLoad();
		}
	};
	iframe.style.width = '100%';
	iframe.style.minWidth = '320px';
	iframe.style.height = '150px';
	iframe.style.border = 'none';
	iframe.style.margin = '50px 0';
	context.page.elements[context.page.elements.length - 1].element.insertAdjacentElement(
		'afterend',
		iframe
	);
	iframeMessagingContext = new IframeMessagingContext(
		iframe.contentWindow,
		'chrome-extension://' + window.reallyreadit.extension.config.extensionId
	);
	iframeMessagingContext.addListener((message, sendResponse) => {
		switch (message.type) {
			case 'rateArticle':
				if (context) {
					eventPageApi
						.rateArticle(context.articleId, message.data)
						.then(sendResponse);
				} else {
					sendResponse(null);
				}
				break;
		}
	});
}
function removeEmbed() {
	if (iframe) {
		iframe.remove();
		iframe = null;
	}
	if (iframeMessagingContext) {
		iframeMessagingContext.destruct();
		iframeMessagingContext = null;
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
						userPageId: context.userPageId
					},
					event.isCompletionCommit
				)
				.then(article => {
					if (article.isRead) {
						if (iframe) {
							iframeMessagingContext.sendMessage({
								type: 'updateArticle',
								data:  article
							});
						} else if (shouldShowEmbed(article)) {
							insertEmbed(() => {
								iframeMessagingContext.sendMessage({
									type: 'updateArticle',
									data: article
								});
							});
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
										userPageId: lookupResult.userPage.id
									};
									page.setReadState(lookupResult.userPage.readState);
									reader.loadPage(page);
									if (shouldShowEmbed(lookupResult.userArticle)) {
										insertEmbed(() => {
											iframeMessagingContext.sendMessage(
												{
													type: 'updateArticle',
													data: lookupResult.userArticle
												}
											);
										});
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