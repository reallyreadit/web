import EventEmitter from './EventEmitter';
import NewReplyNotification from './api/models/NewReplyNotification';

export interface InitData {
	title: string,
	newReplyNotification: NewReplyNotification
}
export interface State {
	title: string,
	isLoading: boolean
}
export enum Intent {
	Success,
	Danger
}
export interface ToastEvent {
	text: string,
	intent: Intent
}
abstract class Page extends EventEmitter<{
	'change': State,
	'reload': void,
	'openDialog': React.ReactElement<any>,
	'closeDialog': React.ReactElement<any>,
	'showToast': ToastEvent,
	'newReplyNotificationChange': NewReplyNotification,
	'ackNewReply': void
}> {
	protected _title: string;
	private _isLoading: boolean;
	private _activeDialog?: React.ReactElement<any>;
	protected _newReplyNotification = {
		lastReply: 0,
		lastNewReplyAck: 0,
		lastNewReplyDesktopNotification: 0
	};
	public setState(state: Partial<State>) {
		if ('title' in state) {
			this._title = state.title;
		}
		if ('isLoading' in state) {
			this._isLoading = state.isLoading;
		}
		this.emitEvent('change', {
			title: this._title,
			isLoading: this._isLoading
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
	public setNewReplyNotificationState(state: NewReplyNotification) {
		if (state.lastNewReplyAck >= this._newReplyNotification.lastNewReplyAck) {
			this._newReplyNotification = state;
			this.emitEvent('newReplyNotificationChange', this._newReplyNotification);
		}
	}
	public ackNewReply() {
		this._newReplyNotification.lastNewReplyAck = Date.now();
		this.emitEvent('newReplyNotificationChange', this._newReplyNotification);
		this.emitEvent('ackNewReply', null);
	}
	public get title() {
		return this._title;
	}
	public get isLoading() {
		return this._isLoading;
	}
	public get activeDialog() {
		return this._activeDialog;
	}
	public get newReplyNotification() {
		return this._newReplyNotification;
	}
}
export default Page;