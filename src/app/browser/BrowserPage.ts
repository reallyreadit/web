import Page, { InitData } from '../common/Page';
import ObjectStore from '../../common/webStorage/ObjectStore';
import NewReplyNotification, { empty as emptyNewReplyNotification } from '../../common/models/NewReplyNotification';
import EventType from '../common/EventType';
import * as Cookies from 'js-cookie';

export default class extends Page {
	private readonly _notificationStore: ObjectStore<NewReplyNotification>;
	constructor(initData: InitData) {
		super();
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
	public setTitle(title: string) {
		window.document.title = title;
	}
	protected _getNewReplyNotification() {
		return this._notificationStore.get();
	}
	protected _setNewReplyNotification(notification: NewReplyNotification) {
		this._notificationStore.set(notification);
	}
	public get isHeroVisible() {
		return !Cookies.get('hideHero');
	}
	public hideHero() {
		Cookies.set('hideHero', 'true');
	}
} 