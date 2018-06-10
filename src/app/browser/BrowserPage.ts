import Page, { InitData, State } from '../common/Page';
import ObjectStore from '../../common/webStorage/ObjectStore';
import NewReplyNotification, { empty as emptyNewReplyNotification } from '../../common/models/NewReplyNotification';
import EventType from '../common/EventType';

export default class extends Page {
	private readonly _notificationStore: ObjectStore<NewReplyNotification>;
	private _isInitialized = false;
	constructor(initData: InitData) {
		super();
		this._title = initData.title;
		this._isReloadable = initData.isReloadable;
		this._notificationStore = new ObjectStore<NewReplyNotification>(
			'newReplyNotification',
			emptyNewReplyNotification
		);
		this._notificationStore.addEventListener((prevNotification, newNotification) => {
			this.emitEvent(
				'newReplyNotificationChange',
				{
					notification: newNotification,
					eventType: EventType.Sync
				}
			);
		});
		this._setNewReplyNotification(initData.newReplyNotification || emptyNewReplyNotification);
	}
	protected _getNewReplyNotification() {
		return this._notificationStore.get();
	}
	protected _setNewReplyNotification(notification: NewReplyNotification) {
		this._notificationStore.set(notification);
	}
	public setState(state: Partial<State>) {
		if (this._isInitialized) {
			super.setState(state);
			if ('title' in state) {
				window.document.title = state.title;
			}
		}
	}
	public initialize() {
		this._isInitialized = true;
	}
} 