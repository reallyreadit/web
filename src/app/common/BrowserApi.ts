import EventEmitter from './EventEmitter';
import UserAccount from '../../common/models/UserAccount';
import SemanticVersion from '../../common/SemanticVersion';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import Post from '../../common/models/social/Post';
import NotificationPreference from '../../common/models/notifications/NotificationPreference';
import ExtensionInstallationEvent from './ExtensionInstallationEvent';
import { ExitReason as OnboardingExitReason } from './components/BrowserRoot/OnboardingFlow';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';

export default abstract class extends EventEmitter<{
	'articleUpdated': ArticleUpdatedEvent,
	'articlePosted': Post,
	'authServiceLinkCompleted': AuthServiceBrowserLinkResponse,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'displayPreferenceChanged': DisplayPreference,
	'extensionInstallationChanged': ExtensionInstallationEvent,
	'notificationPreferenceChanged': NotificationPreference,
	'onboardingEnded': OnboardingExitReason,
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
	public abstract onboardingEnded(reason: OnboardingExitReason): void;
	public abstract setTitle(title: string): void;
	public abstract updateAvailable(version: SemanticVersion): void;
	public abstract userSignedIn(profile: WebAppUserProfile): void;
	public abstract userSignedOut(): void;
	public abstract userUpdated(user: UserAccount): void;
}