import App from '../common/App';
import Environment from '../common/Environment';
import WebViewMessagingContext from './WebViewMessagingContext';

export default class extends App {
	private readonly _app: WebViewMessagingContext | undefined;
	constructor(environment: Environment) {
		super();
		if (environment === Environment.App) {
			this._app = new WebViewMessagingContext();
		}
	}
	public readArticle(url: string) {
		this._app.sendMessage({
			type: 'readArticle',
			data: url
		});
	}
}