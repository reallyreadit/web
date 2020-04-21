import ExtensionApi from '../common/ExtensionApi';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import UserAccount from '../../common/models/UserAccount';
import ExtensionInstallationEvent from '../common/ExtensionInstallationEvent';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';

export default class extends ExtensionApi {
    public articleUpdated(event: ArticleUpdatedEvent) {
        throw new Error('Operation not supported in server environment');
    }
    public authServiceLinkCompleted(response: AuthServiceBrowserLinkResponse) {
        throw new Error('Operation not supported in server environment');
    }
    public commentPosted(comment: CommentThread) {
        throw new Error('Operation not supported in server environment');
    }
    public commentUpdated(comment: CommentThread) {
        throw new Error('Operation not supported in server environment');
    }
    public extensionInstallationChanged(event: ExtensionInstallationEvent) {
        throw new Error('Operation not supported in server environment');
    }
    public userUpdated(user: UserAccount) {
        throw new Error('Operation not supported in server environment');
    }
}