import BrowserApi from '../common/BrowserApi';
import UserAccount from '../../common/models/UserAccount';
import SemanticVersion from '../../common/SemanticVersion';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import Post from '../../common/models/social/Post';
import NotificationPreference from '../../common/models/notifications/NotificationPreference';
import ExtensionInstallationEvent from '../common/ExtensionInstallationEvent';
import { ExitReason as OnboardingExitReason } from '../common/components/BrowserRoot/OnboardingFlow';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';

export default class extends BrowserApi {
	private _title: string;
	public setTitle(title: string) {
		this._title = title;
	}
	public articleUpdated(event: ArticleUpdatedEvent) {
		throw new Error('Operation not supported in server environment');
	}
	public articlePosted(post: Post) {
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
	public getTitle() {
		return this._title;
	}
	public notificationPreferenceChanged(preference: NotificationPreference) {
		throw new Error('Operation not supported in server environment');
	}
	public onboardingEnded(reason: OnboardingExitReason) {
		throw new Error('Operation not supported in server environment');
	}
	public updateAvailable(version: SemanticVersion) {
		throw new Error('Operation not supported in server environment');
	}
	public userSignedIn(user: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
	public userSignedOut() {
		throw new Error('Operation not supported in server environment');
	}
	public userUpdated(user: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
}