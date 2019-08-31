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
		messagingContext.addListener(message => {
			switch (message.type) {
				case 'articlePosted':
					this.emitEvent('articlePosted', message.data);
					break;
				case 'articleUpdated':
					this.emitEvent('articleUpdated', message.data);
					break;
				case 'commentPosted':
					this.emitEvent('commentPosted', message.data);
					break;
			}
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