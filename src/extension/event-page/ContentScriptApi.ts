import Source from '../common/Source';
import ContentScriptOptions from '../common/ContentScriptOptions';
import ContentPageData from '../common/ContentPageData';

export default class ContentScriptApi {
	constructor(handlers: {
		onFindSource: (hostname: string) => Promise<Source>,
		onRegisterTab: (tabId: number, articleSlug: string) => void,
		onGetOptions: () => ContentScriptOptions,
		onCommit: (data: ContentPageData) => ContentPageData,
		onUnregisterTab: (tabId: number) => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'findSource':
					handlers.onFindSource(message.data.hostname).then(sendResponse);
					return true;
				case 'registerTab':
					handlers.onRegisterTab(sender.tab.id, message.data.articleSlug);
					break;
				case 'getOptions':
					sendResponse(handlers.onGetOptions());
					break;
				case 'commit':
					sendResponse(handlers.onCommit(message.data.data));
					break;
				case 'unregisterTab':
					handlers.onUnregisterTab(sender.tab.id);
					break;
			}
			return false;
		});
	}
}