import Page from '../../common/reading/Page';
import EventPageApi from './EventPageApi';
import { SourceRuleAction } from '../../common/models/SourceRule';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import LazyScript from './LazyScript';
import ContentElement from '../../common/reading/ContentElement';
import { ParseMode } from '../../common/reading/parseDocumentContent';
import Reader from '../../common/reading/Reader';
import createPageParseResult from '../../common/reading/createPageParseResult';

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

function rateArticle(score: number) {
	if (context) {
		return eventPageApi
			.rateArticle(context.articleId, score)
			.then(rating => {
				userInterface
					.get()
					.then(ui => {
						ui.update({
							ratingScore: rating.score
						});
					});
			});
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
						userPageId: context.userPageId
					},
					event.isCompletionCommit
				)
				.then(userArticle => {
					if (userArticle.isRead) {
						userInterface
							.get()
							.then(ui => {
								if (ui.isConstructed()) {
									ui.update(userArticle);
								} else {
									ui.construct(
										context.page,
										{
											...userArticle,
											onSelectRating: rateArticle
										}
									);
								}
							});
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
									if (lookupResult.userArticle.isRead) {
										userInterface
											.get()
											.then(ui => {
												ui.construct(
													page,
													{
														...lookupResult.userArticle,
														onSelectRating: rateArticle
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