import Page from '../../common/reading/Page';
import EventPageApi from './EventPageApi';
import { SourceRuleAction } from '../../common/models/SourceRule';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import LazyScript from './LazyScript';
import ContentElement from '../../common/reading/ContentElement';
import { ParseMode } from '../../common/reading/parseDocumentContent';
import Reader from '../../common/reading/Reader';
import createPageParseResult from '../../common/reading/createPageParseResult';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';

window.reallyreadit = {
	extension: {
		contentScript: {
			contentParser: new LazyScript(() => {
				eventPageApi.loadContentParser();
			}),
			userInterface: new LazyScript(() => {
				eventPageApi.loadUserInterface();
			})
		}
	}
};

const { contentParser, userInterface } = window.reallyreadit.extension.contentScript;

let
	context: {
		lookupResult: ArticleLookupResult,
		path: string,
		page: Page
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

function rateArticle(score: number) {
	if (context) {
		return eventPageApi.rateArticle(context.lookupResult.userArticle.id, score);
	} else {
		return Promise.reject();
	}
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
				.then(userArticle => {
					userInterface
						.get()
						.then(ui => {
							ui.update({
								progress: {
									isLoading: false,
									value: {
										isRead: userArticle.isRead,
										percentComplete: userArticle.percentComplete
									}
								}
							});
						})
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
									context = { lookupResult, page, path };
									page.setReadState(lookupResult.userPage.readState);
									reader.loadPage(page);
									userInterface
										.get()
										.then(ui => {
											ui.construct(
												page,
												{
													onSelectRating: rateArticle,
													progress: {
														isLoading: false,
														value: {
															isRead: lookupResult.userArticle.isRead,
															percentComplete: lookupResult.userArticle.percentComplete
														}
													},
													selectedRating: null	// TODO: rating needs to be added to UserArticle
												}
											);
										});
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
		userInterface
			.get()
			.then(ui => {
				ui.destruct();
			});
		reader.unloadPage();
		context.page.remove();
		context = null;
		return eventPageApi.unregisterPage();
	}
	return Promise.resolve();
}

// event handlers
window.addEventListener('unload', () => eventPageApi.unregisterContentScript());

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