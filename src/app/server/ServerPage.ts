import Page from '../common/Page';

export default class ServerPage extends Page {
	public getInitData() {
		return {
			title: this._title,
			isReloadable: this._isReloadable,
			newReplyNotification: this._newReplyNotification
		};
	}
}