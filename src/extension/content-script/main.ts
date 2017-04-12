import Page from './Page';
import EventPageApi from './EventPageApi';
import ContentScriptConfig from '../common/ContentScriptConfig';
import parseDocumentMetadata from './parseDocumentMetadata';
import parseDocumentContent from './parseDocumentContent';

console.log('[rrit] loading main.ts...');

// local state
let isReading = false,
	context: {
		path: string,
		page?: Page
	} = { path: window.location.pathname },
	config: ContentScriptConfig,
	showOverlay: boolean;

// event page interface
let historyStateUpdatedTimeout: number;

const eventPageApi = new EventPageApi({
	onLoadPage: loadPage,
	onUnloadPage: unloadPage,
	onShowOverlay: value => {
		showOverlay = value;
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
				console.log('[rrit] url changed...');
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
		if (context.page.isRead()) {
			console.log('[rrit] reading complete');
			stopReading();
			commitReadState();
		} else if (timers.readWord.rate === config.idleReadRate) {
			console.log('[rrit] resuming reading...');
			window.clearInterval(timers.readWord.handle);
			timers.readWord = {
				handle: window.setInterval(readWord, config.readWordRate),
				rate: config.readWordRate
			};
			timers.commitReadState = window.setInterval(commitReadState, config.readStateCommitRate);
		}
	} else if (timers.readWord.rate === config.readWordRate) {
		console.log('[rrit] suspending reading...');
		window.clearInterval(timers.readWord.handle);
		timers.readWord = {
			handle: window.setInterval(readWord, config.idleReadRate),
			rate: config.idleReadRate
		};
		window.clearInterval(timers.commitReadState);
	}
}
function updatePageOffset() {
	context.page.updateOffset();
}
function commitReadState() {
	console.log('[rrit] commitReadState');
	eventPageApi
		.commitReadState(context.page.getReadStateCommitData())
		.catch(unloadPage);
}

// reading lifecycle
function startReading() {
	if (!isReading && !context.page.isRead()) {
		console.log('[rrit] startReading');
		timers.readWord = {
			handle: window.setInterval(readWord, config.idleReadRate),
			rate: config.idleReadRate
		};
		timers.updatePageOffset = window.setInterval(updatePageOffset, config.pageOffsetUpdateRate);
		isReading = true;
		readWord();
	}
}
function stopReading() {
	if (isReading) {
		console.log('[rrit] stopReading');
		clearTimeout(timers.readWord.handle);
		clearInterval(timers.updatePageOffset);
		clearInterval(timers.commitReadState);
		isReading = false;
	}
}

// page lifecycle
function loadPage() {
	console.log('[rrit] loadPage');
	unloadPage().then(() => {
		const metadata = parseDocumentMetadata();
		if (metadata.url && metadata.article.title) {
			const contentEls = parseDocumentContent();
			if (contentEls.size) {
				context.page = new Page(contentEls, showOverlay);
				eventPageApi
					.registerPage({ ...metadata, wordCount: context.page.wordCount })
					.then(userPage => {
						console.log('[rrit] initializing page...');
						context.page.initialize(userPage);
						if (document.visibilityState === 'visible') {
							startReading();
						}
					})
					.catch(() => {
						console.error('[rrit] failed to register page');
						unloadPage();
					});
			} else {
				console.log('[rrit] no content found');
			}
		} else {
			console.log('[rrit] no metadata found');
		}
	});
}
function unloadPage() {
	if (context.page) {
		console.log('[rrit] unloadPage');
		stopReading();
		context.page.remove();
		context.page = null;
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
	.then(initData => {
		console.log('[rrit] initializing content script...');
		config = initData.config;
		showOverlay = initData.showOverlay;
		if (initData.loadPage) {	
			loadPage();
		}
	});

// debug
(<any>window).getContext = () => context;