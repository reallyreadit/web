import UserArticle from '../common/UserArticle';

export default class BrowserActionApi {
	constructor(handlers: {
		onGetState: () => Promise<{
			isAuthenticated: boolean,
			userArticle: UserArticle,
			showOverlay: boolean
		}>,
		onUpdateShowOverlay: (showOverlay: boolean) => void
	}) {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (message.to === 'eventPage') {
				switch (message.type) {
					case 'getState':
						handlers
							.onGetState()
							.then(sendResponse);
						return true;
					case 'updateShowOverlay':
						handlers.onUpdateShowOverlay(message.data);
						break;
				}
			}
			return undefined;
		});
	}
}