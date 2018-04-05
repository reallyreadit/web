import App from '../common/App';
import ClientType from '../common/ClientType';
import WebViewMessagingContext from './WebViewMessagingContext';
import UserArticle from '../../common/models/UserArticle';

export default class extends App {
	private readonly _app: WebViewMessagingContext | undefined;
	constructor(clientType: ClientType) {
		super();
		if (clientType === ClientType.App) {
			this._app = new WebViewMessagingContext();
		}
	}
	public readArticle(article: UserArticle) {
		this._app.sendMessage({
			type: 'readArticle',
			data: article
		});
	}
}