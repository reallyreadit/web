import App from '../common/App';
import ClientType from '../common/ClientType';
import WebViewMessagingContext from './WebViewMessagingContext';
import UserArticle from '../../common/models/UserArticle';

export default class extends App {
	private readonly _app: WebViewMessagingContext | undefined;
	constructor(clientType: ClientType, onArticleUpdated: (data: { article: UserArticle, isCompletionCommit: boolean }) => void) {
		super();
		if (clientType === ClientType.App) {
			this._app = new WebViewMessagingContext();
			this._app.addListener((message: { type: string, data: any }) => {
				switch (message.type) {
					case 'articleUpdated':
						onArticleUpdated(message.data);
						return;
				}
			});
		}
	}
	public readArticle(article: UserArticle) {
		this._app.sendMessage({
			type: 'readArticle',
			data: article
		});
	}
}