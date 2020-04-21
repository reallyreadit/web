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
	private readonly _channel: BroadcastChannel | null;
	constructor() {
		super();
		try {
			this._channel = new BroadcastChannel('BrowserApi');
			this._channel.addEventListener('message', ev => {
				switch (ev.data.type) {
					case 'updateAvailable':
						this.emitEvent(ev.data.type, new SemanticVersion(ev.data.data));
						break;
					default:
						this.emitEvent(ev.data.type, ev.data.data);
				}
			});
		} catch (ex) {
			this._channel = null;
		}
	}
	private broadcastUpdate(type: string, data?: {}) {
		if (this._channel) {
			this._channel.postMessage({ type, data });}
	}
	public articleUpdated(event: ArticleUpdatedEvent) {
		this.broadcastUpdate('articleUpdated', event);
	}
	public articlePosted(post: Post) {
		this.broadcastUpdate('articlePosted', post);
	}
	public authServiceLinkCompleted(response: AuthServiceBrowserLinkResponse) {
		this.broadcastUpdate('authServiceLinkCompleted', response);
	}
	public commentPosted(comment: CommentThread) {
		this.broadcastUpdate('commentPosted', comment);
	}
	public commentUpdated(comment: CommentThread) {
		this.broadcastUpdate('commentUpdated', comment);
	}
	public extensionInstallationChanged(event: ExtensionInstallationEvent) {
		this.broadcastUpdate('extensionInstallationChanged', event);
	}
	public notificationPreferenceChanged(preference: NotificationPreference) {
		this.broadcastUpdate('notificationPreferenceChanged', preference);
	}
	public onboardingEnded(reason: OnboardingExitReason) {
		this.broadcastUpdate('onboardingEnded', reason);
	}
	public setTitle(title: string) {
		window.document.title = title;
	}
	public updateAvailable(version: SemanticVersion) {
		this.broadcastUpdate('updateAvailable', version.toString());
	}
	public userSignedIn(user: UserAccount) {
		this.broadcastUpdate('userSignedIn', user);
	}
	public userSignedOut() {
		this.broadcastUpdate('userSignedOut');
	}
	public userUpdated(user: UserAccount) {
		this.broadcastUpdate('userUpdated', user);
	}
}