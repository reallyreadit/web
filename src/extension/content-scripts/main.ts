import ContentPage from './ContentPage';
import EventPageApi from './EventPageApi';
import ContentPageData from '../common/ContentPageData';
import ContentScriptOptions from '../common/ContentScriptOptions';

console.log('loading main.ts...');

var isReading = false,
	intervals: {
		readWord?: number,
		updatePageOffset?: number,
		commitReadState?: number,
		checkUrl?: number
	} = {},
	page: ContentPage,
	options: ContentScriptOptions;

const api = new EventPageApi(updateReadState);


// read intervals
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
	api.commit(page.serialize())
		.then(data => {
			if (data) {
				page.update(data);
			}
		});
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
	if (!isReading && !page.isRead()) {
		// intervals.readWord = window.setInterval(readWord, options.wordReadRate);
		// intervals.updatePageOffset = window.setInterval(updatePageOffset, options.pageOffsetUpdateRate);
		// intervals.commitReadState = window.setInterval(commitReadState, options.readStateCommitRate);
		// intervals.checkUrl = window.setInterval(checkUrl, options.urlCheckRate);
		isReading = true;
	}
}
function stopReading() {
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

// helpers
function updateReadState(data: ContentPageData) {
	if (page.slug === data.slug) {
		page.update(data);
	}
}

console.log('initializing page...');
api.findSource(window.location.hostname).then(source => {
	eval(source.parser)
	const pageParams = window._getContentPageMetadata();
	if (pageParams) {
		console.log('page parsed...');
		page = new ContentPage(pageParams, source);
		api.getOptions().then(opts => {
			options = opts;
			// set document visibility event handler
			document.addEventListener('visibilitychange', function () {
				// toggle reading based on document visibility
				if (document.hidden) {
					stopReading();
				} else {
					startReading();
				}
			});
			// set window unload event handler
			window.addEventListener('unload', function () {
				// unregister tab
				api.unregisterTab();
			});
			// start reading!
			if (document.visibilityState === 'visible') {
				startReading();
			}
		});
	}
});

(window as any).ctx = {
	page, api, readWord, updatePageOffset, commitReadState, checkUrl
};