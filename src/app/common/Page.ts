import EventEmitter from './EventEmitter';
import NewReplyNotification, { isStateEqual as isNotificationStateEqual } from '../../common/models/NewReplyNotification';
import EventType from './EventType';

export interface InitData {
	newReplyNotification: NewReplyNotification
}
export default abstract class extends EventEmitter<{
	'reload': void,
	'openDialog': React.ReactElement<any>,
	'closeDialog': React.ReactElement<any>,
	'newReplyNotificationChange': {
		notification: NewReplyNotification,
		eventType: EventType
	}
}> {
	// dialog
	private _activeDialog?: React.ReactElement<any>;
	// new reply notification
	protected abstract _getNewReplyNotification(): NewReplyNotification;
	protected abstract _setNewReplyNotification(notification: NewReplyNotification): void;
	public abstract setTitle(title: string): void;
	public reload() {
		this.emitEvent('reload', null);
	}
	public openDialog(dialog: React.ReactElement<any>) {
		this._activeDialog = dialog;
		this.emitEvent('openDialog', dialog);
	}
	public closeDialog() {
		const dialog = this._activeDialog;
		this._activeDialog = null;
		this.emitEvent('closeDialog', dialog);
	}
	public setNewReplyNotification(notification: NewReplyNotification) {
		if (notification.timestamp > this._getNewReplyNotification().timestamp) {
			const hasStateChanged = !isNotificationStateEqual(this._getNewReplyNotification(), notification);
			this._setNewReplyNotification(notification);
			if (hasStateChanged) {
				this.emitEvent(
					'newReplyNotificationChange',
					{
						notification: this._getNewReplyNotification(),
						eventType: EventType.Original
					}
				);
			}
		}
	}
	public get activeDialog() {
		return this._activeDialog;
	}
	public get newReplyNotification() {
		return this._getNewReplyNotification();
	}
	public abstract get isHeroVisible(): boolean;
	public abstract hideHero(): void;
}