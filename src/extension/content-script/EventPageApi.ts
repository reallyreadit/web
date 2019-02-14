import ContentScriptInitData from '../common/ContentScriptInitData';
import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ParseResult from '../../common/reading/ParseResult';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import Rating from '../../common/models/Rating';

export default class EventPageApi {
	private static sendMessage<T>(type: string, data?: {}) {
		return new Promise<T>((resolve, reject) => {
			try {
				chrome.runtime.sendMessage({ to: 'eventPage', type, data }, resolve);
			} catch (ex) {
				reject();
			}
		});
	}
	constructor(handlers: {
		onLoadPage: () => void,
		onUnloadPage: () => void,
		onShowOverlay: (value: boolean) => void,
		onHistoryStateUpdated: (url: string) => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'loadPage':
					handlers.onLoadPage();
					break;
				case 'unloadPage':
					handlers.onUnloadPage();
					break;
				case 'showOverlay':
					handlers.onShowOverlay(message.data);
					break;
				case 'updateHistoryState':
					handlers.onHistoryStateUpdated(message.data);
					break;
			}
		});
	}
	public rateArticle(articleId: number, score: number) {
		return EventPageApi.sendMessage<Rating>('rateArticle', { articleId, score });
	}
	public registerContentScript(location: Location) {
		return EventPageApi.sendMessage<ContentScriptInitData>('registerContentScript', location.toString());
	}
	public registerPage(data: ParseResult) {
		return EventPageApi.sendMessage<ArticleLookupResult>('registerPage', data);
	}
	public commitReadState(commitData: ReadStateCommitData, isCompletionCommit: boolean) {
		return EventPageApi.sendMessage<UserArticle>('commitReadState', { commitData, isCompletionCommit });
	}
	public unregisterPage() {
		return EventPageApi.sendMessage<void>('unregisterPage');
	}
	public unregisterContentScript() {
		return EventPageApi.sendMessage<void>('unregisterContentScript');
	}
	public loadContentParser() {
		return EventPageApi.sendMessage<void>('loadContentParser');
	}
	public loadUserInterface() {
		return EventPageApi.sendMessage<void>('loadUserInterface');
	}
}