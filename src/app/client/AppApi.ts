import AppApi from '../common/AppApi';
import WebViewMessagingContext from './WebViewMessagingContext';
import UserArticle from '../../common/models/UserArticle';

export default class extends AppApi {
	private readonly _app: WebViewMessagingContext | undefined;
	constructor() {
		super();
		this._app = new WebViewMessagingContext();
		this._app.addListener((message: { type: string, data: any }, sender, sendResponse) => {
			switch (message.type) {
				case 'articleUpdated':
					this.emitEvent('articleUpdated', message.data);
					return false;
				case 'fetch':
					const init: RequestInit = {
						method: message.data.method,
						credentials: 'include'
					};
					if (message.data.data) {
						init.headers = { 'Content-Type': 'application/json' };
						init.body = JSON.stringify(message.data.data);
					}
					fetch(message.data.uri, init)
						.then(res => res.json())
						.then(data => sendResponse({ data }))
						.catch(error => sendResponse({ error }));
					return true;
			}
			return false;
		});
	}
	public readArticle(article: Pick<UserArticle, 'title' | 'url'>) {
		this._app.sendMessage({
			type: 'readArticle',
			data: article
		});
	}
}