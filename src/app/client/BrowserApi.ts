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
	private broadcastUpdate(type: string, data?: {}) {
		if (this._channel) {
			this._channel.postMessage({ type, data });}
	}
	public setTitle(title: string) {
		window.document.title = title;
	}
	public setPath(path: string) {
		const meta = window.document.querySelector<HTMLMetaElement>('meta[name="apple-itunes-app"]');
		meta.content = meta.content.replace(/(\sapp-argument=https?:\/\/[^\/]+)[^,]*/, '$1' + path);
	}
	public updateArticle(article: UserArticle) {
		this.broadcastUpdate('articleUpdated', article);
	}
	public updateAvailable(version: number) {
		this.broadcastUpdate('updateAvailable', version);
	}
	public updateUser(user: UserAccount) {
		this.broadcastUpdate('userUpdated', user);
	}
}