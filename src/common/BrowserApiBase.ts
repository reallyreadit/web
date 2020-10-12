import EventEmitter from '../app/common/EventEmitter';
import UserAccount from './models/UserAccount';
import SemanticVersion from './SemanticVersion';
import ArticleUpdatedEvent from './models/ArticleUpdatedEvent';
import CommentThread from './models/CommentThread';
import Post from './models/social/Post';
import NotificationPreference from './models/notifications/NotificationPreference';
import ExtensionInstallationEvent from '../app/common/ExtensionInstallationEvent';
import { AuthServiceBrowserLinkResponse } from './models/auth/AuthServiceBrowserLinkResponse';
import WebAppUserProfile from './models/userAccounts/WebAppUserProfile';
import DisplayPreference from './models/userAccounts/DisplayPreference';

export default abstract class BrowserApiBase extends EventEmitter<{
	'articleUpdated': ArticleUpdatedEvent,
	'articlePosted': Post,
	'authServiceLinkCompleted': AuthServiceBrowserLinkResponse,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'displayPreferenceChanged': DisplayPreference,
	'extensionInstallationChanged': ExtensionInstallationEvent,
	'notificationPreferenceChanged': NotificationPreference,
	'updateAvailable': SemanticVersion,
	'userSignedIn': WebAppUserProfile | UserAccount,
	'userSignedOut': void,
	'userUpdated': UserAccount
}> {
	public abstract articleUpdated(event: ArticleUpdatedEvent): void;
	public abstract articlePosted(post: Post): void;
	public abstract authServiceLinkCompleted(response: AuthServiceBrowserLinkResponse): void;
	public abstract commentPosted(comment: CommentThread): void;
	public abstract commentUpdated(comment: CommentThread): void;
	public abstract displayPreferenceChanged(preference: DisplayPreference): void;
	public abstract extensionInstallationChanged(event: ExtensionInstallationEvent): void;
	public abstract notificationPreferenceChanged(preference: NotificationPreference): void;
	public abstract setTitle(title: string): void;
	public abstract updateAvailable(version: SemanticVersion): void;
	public abstract userSignedIn(profile: WebAppUserProfile): void;
	public abstract userSignedOut(): void;
	public abstract userUpdated(user: UserAccount): void;
}