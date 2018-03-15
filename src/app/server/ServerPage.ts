import Page from '../common/Page';
import NewReplyNotification, { empty as emptyNewReplyNotification } from '../../common/models/NewReplyNotification';

export default class extends Page {
	private _newReplyNotification: NewReplyNotification;
	constructor(newReplyNotification: NewReplyNotification) {
		super();
		this._newReplyNotification = newReplyNotification || emptyNewReplyNotification;
	}
	protected _getNewReplyNotification() {
		return this._newReplyNotification;
	}
	protected _setNewReplyNotification(notification: NewReplyNotification) {
		this._newReplyNotification = notification;
	}
	public getInitData() {
		return {
			title: this._title,
			isReloadable: this._isReloadable,
			newReplyNotification: this._newReplyNotification
		};
	}
}