import BrowserApi from '../common/BrowserApi';
import UserArticle from '../../common/models/UserArticle';
import UserAccount from '../../common/models/UserAccount';

export default class extends BrowserApi {
	private readonly _channel = new BroadcastChannel('BrowserApi');
	constructor() {
		super();
		this._channel.addEventListener('message', ev => {
			this.emitEvent(ev.data.type, ev.data.data);
		});
	}
	private broadcastUpdate(type: string, data: {}) {
		this._channel.postMessage({ type, data });
	}
	public setTitle(title: string) {
		window.document.title = title;
	}
	public updateArticle(article: UserArticle) {
		this.broadcastUpdate('articleUpdated', article);
	}
	public updateUser(user: UserAccount) {
		this.broadcastUpdate('userUpdated', user);
	}
}