import Source from '../common/Source';
import ContentScriptOptions from '../common/ContentScriptOptions';
import ContentPageData from '../common/ContentPageData';

export default class EventPageApi {
	private static sendMessage<T>(type: string, data?: {}) {
		return new Promise<T>((resolve, reject) => {
			try {
				chrome.runtime.sendMessage({ type, data }, resolve);
			} catch (ex) {
				reject();
			}
		});
	}
	constructor(onUpdate: (data: ContentPageData) => void) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case 'update':
					onUpdate(message.data);
					break;
			}
		});
	}
	public findSource(hostname: string) {
		return EventPageApi.sendMessage<Source>('findSource', { hostname });
	}
	public registerTab(articleSlug: string) {
		return EventPageApi.sendMessage<void>('registerTab', { articleSlug });
	}
	public getOptions() {
		return EventPageApi.sendMessage<ContentScriptOptions>('getOptions');
	}
	public commit(data: ContentPageData) {
		return EventPageApi.sendMessage<ContentPageData>('commit', { data });
	}
	public unregisterTab() {
		return EventPageApi.sendMessage<void>('unregisterTab');
	}
}