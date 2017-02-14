import Page from './Page';
import EventPageApi from './EventPageApi';
import ContentScriptConfig from '../common/ContentScriptConfig';

console.log('loading main.ts...');

// local state
let isReading = false,
	context: {
		path: string,
		page?: Page
	} = { path: window.location.pathname },
	config: ContentScriptConfig,
	showOverlay: boolean;

// event page interface
const eventPageApi = new EventPageApi({
	onLoadPage: loadPage,
	onUnloadPage: unloadPage,
	onShowOverlay: value => {
		showOverlay = value;
		if (context.page) {
			context.page.showOverlay(value);
		}
	}
});

// timers
const timers: {
	readWord?: {
		handle?: number,
		rate?: number
	},
	updatePageOffset?: number,
	commitReadState?: number,
	checkUrl?: number
} = { readWord: {} };

// intervalic functions
function readWord() {
	if (context.page.readWord()) {
		if (context.page.isRead()) {
			console.log('reading complete');
			stopReading();
			commitReadState();
		} else if (timers.readWord.rate === config.idleReadRate) {
			console.log('resuming reading...');
			window.clearInterval(timers.readWord.handle);
			timers.readWord = {
				handle: window.setInterval(readWord, config.wordReadRate),
				rate: config.wordReadRate
			};
			timers.commitReadState = window.setInterval(commitReadState, config.readStateCommitRate);
		}
	} else if (timers.readWord.rate === config.wordReadRate) {
		console.log('suspending reading...');
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
	console.log('commitReadState');
	eventPageApi
		.commitReadState(context.page.getReadStateCommitData())
		.catch(unloadPage);
}
function checkUrl() {
	if (window.location.pathname !== context.path) {
		console.log('url changed...');
		context.path = window.location.pathname;
		loadPage();
	}
}

// reading lifecycle
function startReading() {
	if (!isReading && !context.page.isRead()) {
		console.log('startReading');
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
		console.log('stopReading');
		clearTimeout(timers.readWord.handle);
		clearInterval(timers.updatePageOffset);
		clearInterval(timers.commitReadState);
		isReading = false;
	}
}

// page lifecycle
function loadPage() {
	console.log('loadPage');
	unloadPage().then(() => {
		const parseResult = window._parse();
		if (parseResult) {
			context.page = new Page(parseResult.element, showOverlay);
			eventPageApi
				.registerPage({
					...parseResult.pageInfo,
					wordCount: parseResult.pageInfo.wordCount ? parseResult.pageInfo.wordCount : context.page.wordCount
				})
				.then(userPage => {
					console.log('initializing page...');
					context.page.initialize(userPage);
					if (document.visibilityState === 'visible') {
						startReading();
					}
				})
				.catch(() => {
					context.page.remove();
					context.page = null;
				});
		}
	});
}
function unloadPage() {
	if (context.page) {
		console.log('unloadPage');
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
		console.log('initializing content script...');
		eval(initData.source.parser)
		config = initData.config;
		showOverlay = initData.showOverlay;
		timers.checkUrl = window.setInterval(checkUrl, initData.config.urlCheckRate);
		loadPage();
	});

// debug
(<any>window).getContext = () => context;