import ExtensionApi from '../common/ExtensionApi';
import NewReplyNotification from '../../common/models/NewReplyNotification';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';

export default class extends ExtensionApi {
    public articleUpdated(event: ArticleUpdatedEvent) {
        throw new Error('Operation not supported in server environment');
    }
    public commentPosted(comment: CommentThread) {
        throw new Error('Operation not supported in server environment');
    }
    public install() {
        throw new Error('Operation not supported in server environment');
    }
    public newReplyNotificationUpdated(notification: NewReplyNotification) {
        throw new Error('Operation not supported in server environment');
    }
    public get isInstalled(): boolean | undefined {
        return undefined;
    }
    public get isBrowserCompatible(): boolean | undefined {
        return undefined;
    }
}