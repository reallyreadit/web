import Page from './Page';
import EventPageApi from './EventPageApi';
import ContentScriptConfig from '../common/ContentScriptConfig';
import { SourceRuleAction } from '../../common/models/SourceRule';
import parseDocumentMetadata from './parseDocumentMetadata';
import parseDocumentContent from './parseDocumentContent';

// local state
let
	isReading = false,
	context = {
		path: window.location.pathname,
		page: null as Page,
		lastCommitPercentComplete: 0
	},
	initData: {
		config: ContentScriptConfig,
		parseMetadata: boolean,
		parseMode: 'analyze' | 'mutate',
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

// timers
const timers: {
	readWord?: {
		handle?: number,
		rate?: number
	},
	updatePageOffset?: number,
	commitReadState?: number
} = { readWord: {} };

function readWord() {
	if (context.page.readWord()) {
		if (timers.readWord.rate === initData.config.idleReadRate) {
			window.clearInterval(timers.readWord.handle);
			timers.readWord = {
				handle: window.setInterval(readWord, initData.config.readWordRate),
				rate: initData.config.readWordRate
			};
			timers.commitReadState = window.setInterval(commitReadState, initData.config.readStateCommitRate);
		}
	} else if (context.page.isRead()) {
		stopReading();
		commitReadState();
	} else if (timers.readWord.rate === initData.config.readWordRate) {
		window.clearInterval(timers.readWord.handle);
		timers.readWord = {
			handle: window.setInterval(readWord, initData.config.idleReadRate),
			rate: initData.config.idleReadRate
		};
		window.clearInterval(timers.commitReadState);
	}
}
function updatePageOffset() {
	context.page.updateOffset();
}
function commitReadState() {
	const
		readState = context.page.getReadState(),
		percentComplete = readState.getPercentComplete();
	eventPageApi
		.commitReadState(
			{
				userPageId: context.page.userPageId,
				readState: readState.readStateArray
			},
			context.lastCommitPercentComplete < 90 && percentComplete >= 90
		)
		.catch(() => {});
	context.lastCommitPercentComplete = percentComplete;
}

// reading lifecycle
function startReading() {
	if (!isReading && !context.page.isRead()) {
		timers.readWord = {
			handle: window.setInterval(readWord, initData.config.idleReadRate),
			rate: initData.config.idleReadRate
		};
		timers.updatePageOffset = window.setInterval(updatePageOffset, initData.config.pageOffsetUpdateRate);
		isReading = true;
		readWord();
	}
}
function stopReading() {
	if (isReading) {
		clearTimeout(timers.readWord.handle);
		clearInterval(timers.updatePageOffset);
		clearInterval(timers.commitReadState);
		isReading = false;
	}
}

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
				!initData.parseMetadata ||
				(metaParseResult.isArticle && metaParseResult.metadata.url && metaParseResult.metadata.article.title) ||
				(rule && rule.action === SourceRuleAction.Read)
			) {
				const content = parseDocumentContent(initData.parseMode);
				// prefer the metadata but fall back to content parse values in case none is present
				const description = metaParseResult.metadata.article.description || content.excerpt;
				if (
					content.elements.length &&
					(!initData.parseMetadata || (metaParseResult.metadata.url && metaParseResult.metadata.article.title))
				) {
					context.page = new Page(content.elements, initData.showOverlay);
					eventPageApi
						.registerPage({
							...metaParseResult.metadata,
							wordCount: content.wordCount,
							readableWordCount: context.page.wordCount,
							article: { ...metaParseResult.metadata.article, description }
						})
						.then(userPage => {
							context.page.initialize(userPage);
							if (document.visibilityState === 'visible') {
								startReading();
							}
						})
						.catch(() => {
							unloadPage();
						});
				}
			}
		}
	});
}
function unloadPage() {
	if (context.page) {
		stopReading();
		context.page.remove();
		context.page = null;
		context.lastCommitPercentComplete = 0;
		return eventPageApi.unregisterPage();
	}
	return Promise.resolve();
}

// event handlers
document.addEventListener('visibilitychange', () => {
	if (context.page) {
		if (document.hidden) {
			stopReading();
		} else {
			startReading();
		}
	}
});
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