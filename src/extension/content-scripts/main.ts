import Page from '../common/Page';
import ReadState from '../common/ReadState';

window._standardBlockSelectors = Page.standardBlockSelectors;

var isReading = false,
	intervals: {
		readWord?: number,
		updatePageOffset?: number,
		commitReadState?: number,
		checkUrl?: number
	} = {},
	page: Page,
	options: { wordReadRate: number, pageOffsetUpdateRate: number, readStateCommitRate: number, urlCheckRate: number };

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
	chrome.runtime.sendMessage({
		command: 'commitReadState',
		data: {
			urlId: page.urlId,
			readStateArray: page.getReadState().readStateArray
		}
	});
}
function checkUrl() {
	var currentUrlId = Page.getUrlId(window.location); 
	if (currentUrlId !== page.urlId) {
		initializePage(currentUrlId);
	}
}

// start/stop reading
function startReading() {
	if (!isReading && !page.isRead()) {
		intervals.readWord = window.setInterval(readWord, options.wordReadRate);
		intervals.updatePageOffset = window.setInterval(updatePageOffset, options.pageOffsetUpdateRate);
		intervals.commitReadState = window.setInterval(commitReadState, options.readStateCommitRate);
		intervals.checkUrl = window.setInterval(checkUrl, options.urlCheckRate);
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
function updateReadState(eventPageData: { urlId: string, readStateArray: number[] }) {
	if (page.urlId === eventPageData.urlId) {
		page.setReadState(new ReadState(eventPageData.readStateArray));
	}
}
function initializePage(urlId: string, callback?: Function) {
	const pageParams = window._getPageParams(urlId);
	if (pageParams) {
		page = new Page(pageParams);
		chrome.runtime.sendMessage(
			{
				command: 'registerTab',
				data: {
					urlId: page.urlId,
					pageNumber: page.number,
					pageLinks: page.pageLinks
				}
			},
			function (response) {
				// update read state
				if (response.pageData.readStateArray !== undefined) {
					updateReadState(response.pageData);
				}
				// set options
				options = response.options;
				// callback
				if (typeof callback === 'function') {
					callback();
				}
			} 
		);
	}
}

// initialize the page at the current location and then initialize the document
initializePage(Page.getUrlId(window.location), function () {
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
		chrome.runtime.sendMessage({
			command: 'unregisterTab',
			data: {
				urlId: page.urlId,
				readStateArray: page.getReadState().readStateArray
			}
		});
	});
	// set chrome message listener
	chrome.runtime.onMessage.addListener(function (request, sender, callback) {
		switch (request.command) {
			case 'updateReadState':
				updateReadState(request.data);
				return;
		}
	});
	// start reading!
	if (document.visibilityState === 'visible') {
		startReading();
	}
});