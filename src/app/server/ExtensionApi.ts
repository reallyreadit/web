import ExtensionApi from '../common/ExtensionApi';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import UserAccount from '../../common/models/UserAccount';

export default class extends ExtensionApi {
    public articleUpdated(event: ArticleUpdatedEvent) {
        throw new Error('Operation not supported in server environment');
    }
    public commentPosted(comment: CommentThread) {
        throw new Error('Operation not supported in server environment');
    }
    public commentUpdated(comment: CommentThread) {
        throw new Error('Operation not supported in server environment');
    }
    public extensionUninstalled() {
        throw new Error('Operation not supported in server environment');
    }
    public userUpdated(user: UserAccount) {
        throw new Error('Operation not supported in server environment');
    }
}