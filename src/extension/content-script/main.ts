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
	context = {
		path: window.location.pathname,
		page: null as Page
	},
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
		if (context.page) {
			context.page.showOverlay(value);
		}
	},
	onHistoryStateUpdated: url => {
		// throttle updates
		window.clearTimeout(historyStateUpdatedTimeout);
		historyStateUpdatedTimeout = window.setTimeout(() => {
			const newPath = new URL(url).pathname;
			if (newPath !== context.path) {
				context.path = newPath;
				// TODO: gotta come up with a more robust way to detect page changes
				setTimeout(loadPage, 2000);
			}
		}, 250);
	}
});

// reader
const reader = new Reader(
	(commitData, isCompletionCommit) => {
		eventPageApi.commitReadState(commitData, isCompletionCommit);
	}
)

// page lifecycle
function loadPage() {
	unloadPage().then(() => {
		// check for matching source rules
		const rule = initData.sourceRules
			.filter(rule => rule.path.test(context.path))
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
							context.page = new Page(
								content.elements.map(el => new ContentElement(el.element, el.wordCount)),
								initData.showOverlay
							);
							eventPageApi
								.registerPage(createPageParseResult(metaParseResult, content))
								.then(userPage => {
									context.page.initialize(userPage);
									reader.loadPage(context.page);
									userInterface
										.get()
										.then(ui => {
											ui.construct(context.page);
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
	if (context.page) {
		userInterface
			.get()
			.then(ui => {
				ui.destruct();
			});
		reader.unloadPage();
		context.page.remove();
		context.page = null;
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