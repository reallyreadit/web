import EventEmitter from './EventEmitter';
import ShareData from '../../common/sharing/ShareData';
import SemanticVersion from '../../common/SemanticVersion';
import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import DeviceInfo from '../../common/models/app/DeviceInfo';
import AppActivationEvent from '../../common/models/app/AppActivationEvent';
import UserAccount from '../../common/models/UserAccount';
import AlertStatus from '../../common/models/app/AlertStatus';
import AppleIdCredential from '../../common/models/app/AppleIdCredential';
import NotificationAuthorizationRequestResult from '../../common/models/app/NotificationAuthorizationRequestResult';
import ShareResult from '../../common/models/app/ShareResult';

export type ArticleReference = { slug: string } | { url: string }
export default abstract class extends EventEmitter<{
	'alertStatusUpdated': AlertStatus,
	'articlePosted': Post,
	'articleUpdated': ArticleUpdatedEvent,
	'authenticateAppleIdCredential': AppleIdCredential,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'didBecomeActive': AppActivationEvent,
	'loadUrl': string
}> {
	public abstract openExternalUrl(url: string): void;
	public abstract readArticle(reference: ArticleReference): void;
	public abstract requestAppleIdCredential(): void;
	public abstract requestNotificationAuthorization(): Promise<NotificationAuthorizationRequestResult>;
	public abstract share(data: ShareData): Promise<ShareResult>;
	public abstract syncAuthCookie(user?: UserAccount): void;
	public abstract get appVersion(): SemanticVersion;
	public abstract get deviceInfo(): DeviceInfo;
}