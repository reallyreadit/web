import App from '../common/App';
import Environment from '../common/Environment';
import WebViewMessagingContext from './WebViewMessagingContext';
import UserArticle from '../../common/models/UserArticle';

export default class extends App {
	private readonly _app: WebViewMessagingContext | undefined;
	constructor(environment: Environment) {
		super();
		if (environment === Environment.App) {
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