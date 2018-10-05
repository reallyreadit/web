import ExtensionApi from '../common/ExtensionApi';
import NewReplyNotification from '../../common/models/NewReplyNotification';

export default class extends ExtensionApi {
    public install() {
        throw new Error('Operation not supported in server environment');
    }
    public updateNewReplyNotification(notification: NewReplyNotification) {
        throw new Error('Operation not supported in server environment');
    }
    public get isInstalled(): boolean | undefined {
        return undefined;
    }
    public get isBrowserCompatible(): boolean | undefined {
        return undefined;
    }
}