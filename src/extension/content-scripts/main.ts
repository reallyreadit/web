import Page from './Page';
import EventPageApi from './EventPageApi';
import ContentScriptOptions from '../common/ContentScriptOptions';

console.log('loading main.ts...');

// local state
let isInitialized = false,
	isReading = false,
	page: Page,
	options: ContentScriptOptions;

// event page
const eventPageApi = new EventPageApi({
	onReinitialize: initialize,
	onTerminate: terminate
});

// read intervals
const intervals: {
	readWord?: number,
	updatePageOffset?: number,
	commitReadState?: number,
	checkUrl?: number
} = {};
function readWord() {
	page.readWord();
	if (page.isRead()) {
		stopReading();
		commitReadState();
	}
}
function updatePageOffset() {
	page.updateOffset();
}
function commitReadState() {
	console.log('committing read state...');
	eventPageApi
		.commitReadState({
			userPageId: page.getUserPageId(),
			readState: page.getReadState().readStateArray
		})
		.catch(terminate);
}
function checkUrl() {
	// TODO: need a better way to detect an article change
	//       extraneous fragments and querystrings can trigger false positives
	// if (window.location.href !== page.url) {
	// 	initializePage();
	// }
}

// start/stop reading
function startReading() {
	console.log('start reading...');
	if (isInitialized && !isReading && !page.isRead()) {
		intervals.readWord = window.setInterval(readWord, options.wordReadRate);
		intervals.updatePageOffset = window.setInterval(updatePageOffset, options.pageOffsetUpdateRate);
		intervals.commitReadState = window.setInterval(commitReadState, options.readStateCommitRate);
		intervals.checkUrl = window.setInterval(checkUrl, options.urlCheckRate);
		isReading = true;
	}
}
function stopReading() {
	console.log('stop reading...');
	clearInterval(intervals.readWord);
	intervals.readWord = undefined;
	clearInterval(intervals.updatePageOffset);
	intervals.updatePageOffset = undefined;
	clearInterval(intervals.commitReadState);
	intervals.commitReadState = undefined;
	clearInterval(intervals.checkUrl);
	intervals.checkUrl = undefined;
	isReading = false;
}

function initialize() {
	console.log('initializing page...');
	eventPageApi
		.registerContentScript(window.location)
		.then(initData => {
			eval(initData.source.parser)
			const parseResult = window._parse();
			if (parseResult) {
				console.log('page parsed');
				page = new Page(parseResult.element);
				options = initData.options;
				eventPageApi
					.registerPage({ ...parseResult.pageInfo, wordCount: (parseResult.pageInfo.wordCount ? parseResult.pageInfo.wordCount : page.getReadState().wordCount) })
					.then(userPage => {
						console.log('tab registered');
						page.setUserPageId(userPage.id)
							.setReadState(userPage.readState);
						isInitialized = true;
						if (document.visibilityState === 'visible') {
							startReading();
						}
					});
			}
		})
		.catch(terminate);
}
function terminate() {
	console.log('terminating page...');
	isInitialized = false;
	stopReading();
}

// event handlers
document.addEventListener('visibilitychange', function () {
	// toggle reading based on document visibility
	if (document.hidden) {
		stopReading();
	} else {
		startReading();
	}
});
window.addEventListener('unload', function () {
	// unregister tab
	eventPageApi.unregisterContentScript();
});

// initialize
initialize();

(window as any).ctx = {
	page, eventPageApi, readWord, updatePageOffset, commitReadState, checkUrl
};