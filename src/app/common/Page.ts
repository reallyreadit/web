import EventEmitter from './EventEmitter';
import NewReplyNotification, { isStateEqual as isNotificationStateEqual } from '../../common/models/NewReplyNotification';

export interface InitData {
	title: string,
	isReloadable: boolean,
	newReplyNotification: NewReplyNotification
}
export interface State {
	title: string,
	isLoading: boolean,
	isReloadable: boolean
}
export enum Intent {
	Success,
	Danger
}
export interface ToastEvent {
	text: string,
	intent: Intent
}
export enum EventType {
	Original,
	Sync
}
export default abstract class extends EventEmitter<{
	'change': State,
	'reload': void,
	'openDialog': React.ReactElement<any>,
	'closeDialog': React.ReactElement<any>,
	'showToast': ToastEvent,
	'newReplyNotificationChange': {
		notification: NewReplyNotification,
		eventType: EventType
	}
}> {
	// title
	protected _title: string;
	private _isLoading: boolean;
	protected _isReloadable: boolean;
	// dialog
	private _activeDialog?: React.ReactElement<any>;
	// new reply notification
	protected abstract _getNewReplyNotification(): NewReplyNotification;
	protected abstract _setNewReplyNotification(notification: NewReplyNotification): void;
	public setState(state: Partial<State>) {
		if ('title' in state) {
			this._title = state.title;
		}
		if ('isLoading' in state) {
			this._isLoading = state.isLoading;
		}
		if ('isReloadable' in state) {
			this._isReloadable = state.isReloadable;
		}
		this.emitEvent('change', {
			title: this._title,
			isLoading: this._isLoading,
			isReloadable: this._isReloadable
		});
	}
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
	public showToast(text: string, intent: Intent) {
		this.emitEvent('showToast', { text, intent });
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
	public get title() {
		return this._title;
	}
	public get isLoading() {
		return this._isLoading;
	}
	public get isReloadable() {
		return this._isReloadable;
	}
	public get activeDialog() {
		return this._activeDialog;
	}
	public get newReplyNotification() {
		return this._getNewReplyNotification();
	}
}