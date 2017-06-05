import Extension from '../common/Extension';
import NewReplyNotification from '../../common/models/NewReplyNotification';

export default class ServerExtension extends Extension {
    public isInstalled() {
        return false;
    }
    public isBrowserCompatible() {
        return false;
    }
    public updateNewReplyNotification(notification: NewReplyNotification) {
        throw new Error('Operation not supported in server environment');
    }
    public getInitData() {
        return this._extensionId;
    }
}