import EventEmitter from './EventEmitter';
import NewReplyNotification from '../../common/models/NewReplyNotification';

abstract class Extension extends EventEmitter<{ 'change': boolean }> {
	protected _extensionId: string;
	constructor(extensionId: string) {
		super();
		this._extensionId = extensionId;
	}
	public abstract isInstalled(): boolean;
	public abstract isBrowserCompatible(): boolean;
	public abstract updateNewReplyNotification(notification: NewReplyNotification): void;
}

export default Extension;