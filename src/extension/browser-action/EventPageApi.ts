import UserArticle from '../common/UserArticle';

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
	public getState() {
		return EventPageApi.sendMessage<{
			isAuthenticated: boolean,
			userArticle: UserArticle,
			showOverlay: boolean
		}>('getState');
	}
	public updateShowOverlay(showOverlay: boolean) {
		return EventPageApi.sendMessage<void>('updateShowOverlay', showOverlay);
	}
}