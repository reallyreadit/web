import BrowserApi from '../common/BrowserApi';
import UserArticle from '../../common/models/UserArticle';
import UserAccount from '../../common/models/UserAccount';

export default class extends BrowserApi {
	private readonly _channel: BroadcastChannel | null;
	constructor() {
		super();
		try {
			this._channel = new BroadcastChannel('BrowserApi');
			this._channel.addEventListener('message', ev => {
				this.emitEvent(ev.data.type, ev.data.data);
			});
		} catch (ex) {
			this._channel = null;
		}
	}
	private broadcastUpdate(type: string, data: {}) {
		if (this._channel) {
			this._channel.postMessage({ type, data });}
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