import Page from '../common/Page';
import NewReplyNotification, { empty as emptyNewReplyNotification } from '../../common/models/NewReplyNotification';

export default class extends Page {
	private _title: string;
	private _newReplyNotification: NewReplyNotification;
	private readonly _isHeroVisible: boolean;
	constructor(newReplyNotification: NewReplyNotification, isHeroVisible: boolean) {
		super();
		this._newReplyNotification = newReplyNotification || emptyNewReplyNotification;
		this._isHeroVisible = isHeroVisible;
	}
	protected _getNewReplyNotification() {
		return this._newReplyNotification;
	}
	protected _setNewReplyNotification(notification: NewReplyNotification) {
		this._newReplyNotification = notification;
	}
	public setTitle(title: string) {
		this._title = title;
	}
	public getInitData() {
		return {
			newReplyNotification: this._newReplyNotification
		};
	}
	public get title() {
		return this._title;
	}
	public get isHeroVisible() {
		return this._isHeroVisible;
	}
	public hideHero() {
		throw new Error('Operation not supported in server environment');
	}
}