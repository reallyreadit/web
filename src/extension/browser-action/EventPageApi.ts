import UserArticle from '../common/UserArticle';

export default class EventPageApi {
	private static _sendMessage<T>(type: string, data?: {}) {
		return new Promise<T>((resolve, reject) => {
			try {
				chrome.runtime.sendMessage({ to: 'eventPage', type, data }, resolve);
			} catch (ex) {
				reject();
			}
		});
	}
	public static getState() {
		return EventPageApi._sendMessage<{
			isAuthenticated: boolean,
			isOnHomePage: boolean,
			userArticle: UserArticle
		}>('getState');
	}
}