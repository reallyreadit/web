import AppApi, { ArticleReference } from '../common/AppApi';
import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import SemanticVersion from '../../common/SemanticVersion';
import ShareData from '../../common/sharing/ShareData';

export default class extends AppApi {
	private readonly _messagingContext: WebViewMessagingContext;
	private _appVersion: SemanticVersion | null;
	constructor(messagingContext: WebViewMessagingContext) {
		super();
		this._messagingContext = messagingContext;
		messagingContext.addListener((message: { type: string, data: any }, sender, sendResponse) => {
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
		messagingContext.sendMessage(
			{
				type: 'getVersion'
			},
			(version: string) => {
				try {
					this._appVersion = new SemanticVersion(version);
				} catch {
					// this._appVersion remains null
				}
			}
		);
	}
	public readArticle(reference: ArticleReference) {
		this._messagingContext.sendMessage({
			type: 'readArticle',
			data: reference
		});
	}
	public share(data: ShareData) {
		this._messagingContext.sendMessage({
			type: 'share',
			data
		});
	}
	public get appVersion() {
		return this._appVersion;
	}
}