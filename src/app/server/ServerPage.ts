import Page, { State } from '../common/Page';

export default class ServerPage extends Page {
	public setState(state: Partial<State>) {
		if ('title' in state) {
			this._title = state.title;
		}
		if ('isReloadable' in state) {
			this._isReloadable = state.isReloadable;
		}
	}
	public getInitData() {
		return {
			title: this._title,
			isReloadable: this._isReloadable,
			newReplyNotification: this._newReplyNotification
		};
	}
}