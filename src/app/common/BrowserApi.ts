import EventEmitter from './EventEmitter';
import UserAccount from '../../common/models/UserAccount';
import SemanticVersion from '../../common/SemanticVersion';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import Post from '../../common/models/social/Post';
import NotificationPreference from '../../common/models/notifications/NotificationPreference';
import ExtensionInstallationEvent from './ExtensionInstallationEvent';
import { ExitReason as OnboardingExitReason } from './components/BrowserRoot/OnboardingFlow';

export default abstract class extends EventEmitter<{
	'articleUpdated': ArticleUpdatedEvent,
	'articlePosted': Post,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'extensionInstallationChanged': ExtensionInstallationEvent,
	'notificationPreferenceChanged': NotificationPreference,
	'onboardingEnded': OnboardingExitReason,
	'updateAvailable': SemanticVersion,
	'userSignedIn': UserAccount,
	'userSignedOut': void,
	'userUpdated': UserAccount
}> {
	public abstract articleUpdated(event: ArticleUpdatedEvent): void;
	public abstract articlePosted(post: Post): void;
	public abstract commentPosted(comment: CommentThread): void;
	public abstract commentUpdated(comment: CommentThread): void;
	public abstract extensionInstallationChanged(event: ExtensionInstallationEvent): void;
	public abstract notificationPreferenceChanged(preference: NotificationPreference): void;
	public abstract onboardingEnded(reason: OnboardingExitReason): void;
	public abstract setTitle(title: string): void;
	public abstract updateAvailable(version: SemanticVersion): void;
	public abstract userSignedIn(user: UserAccount): void;
	public abstract userSignedOut(): void;
	public abstract userUpdated(user: UserAccount): void;
}