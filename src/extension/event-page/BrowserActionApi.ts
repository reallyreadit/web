import UserArticle from '../common/UserArticle';

export default class BrowserActionApi {
	constructor(handlers: {
		onGetState: () => Promise<{
			isAuthenticated: boolean,
			isOnHomePage: boolean,
			userArticle: UserArticle
		}>
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'eventPage') {
				switch (message.type) {
					case 'getState':
						handlers
							.onGetState()
							.then(sendResponse);
						return true;
				}
			}
			return undefined;
		});
	}
}