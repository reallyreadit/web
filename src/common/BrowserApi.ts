import BrowserApiBase from './BrowserApiBase';
import UserAccount from './models/UserAccount';
import SemanticVersion from './SemanticVersion';
import ArticleUpdatedEvent from './models/ArticleUpdatedEvent';
import CommentThread from './models/CommentThread';
import Post from './models/social/Post';
import NotificationPreference from './models/notifications/NotificationPreference';
import ExtensionInstallationEvent, { ExtensionUninstalledEvent, ExtensionInstalledEvent } from '../app/common/ExtensionInstallationEvent';
import { AuthServiceBrowserLinkResponse } from './models/auth/AuthServiceBrowserLinkResponse';
import WebAppUserProfile from './models/userAccounts/WebAppUserProfile';
import DisplayPreference from './models/userAccounts/DisplayPreference';

export type BroadcastEventListener = (messageData: any) => void;
interface BroadcastChannelInterface {
	addEventListener: (listener: BroadcastEventListener) => void,
	postMessage: (data: any) => void
}
export class BrowserBroadcastChannel {
	private readonly _channel: BroadcastChannel | null;
	private readonly _listeners: BroadcastEventListener[] = [];
	constructor() {
		try {
			this._channel = new BroadcastChannel('BrowserApi');
			this._channel.addEventListener(
				'message',
				event => {
					this._listeners.forEach(
						listener => {
							listener(event.data);
						}
					);
			});
		} catch (ex) {
			this._channel = null;
		}
	}
	public addEventListener(listener: BroadcastEventListener) {
		this._listeners.push(listener);
	}
	public postMessage(data: any) {
		if (!this._channel) {
			return;
		}
		this._channel.postMessage(data);
	}
}
type SerializedExtensionInstallationEvent = (
	Pick<ExtensionInstalledEvent, 'type'> & {
		version: string
	} |
	ExtensionUninstalledEvent
);
export default class BrowserApi extends BrowserApiBase {
	private readonly _channel: BroadcastChannelInterface;
	constructor(
		channel: BroadcastChannelInterface = new BrowserBroadcastChannel()
	) {
		super();
		this._channel = channel;
		this._channel.addEventListener(
			messageData => {
				switch (messageData.type) {
					case 'extensionInstallationChanged':
						const serializedEvent = messageData.data as SerializedExtensionInstallationEvent;
						let data: ExtensionInstallationEvent;
						switch (serializedEvent.type) {
							case 'installed':
								data = {
									...serializedEvent,
									version: new SemanticVersion(serializedEvent.version)
								};
								break;
							case 'uninstalled':
								data = serializedEvent;
								break;
						}
						this.emitEvent(messageData.type, data);
						break;
					case 'updateAvailable':
						this.emitEvent(messageData.type, new SemanticVersion(messageData.data));
						break;
					default:
						this.emitEvent(messageData.type, messageData.data);
				}
			}
		);
	}
	private broadcastUpdate(type: string, data?: {}) {
		this._channel.postMessage({ type, data });	
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
	public displayPreferenceChanged(preference: DisplayPreference) {
		this.broadcastUpdate('displayPreferenceChanged', preference);
	}
	public extensionInstallationChanged(event: ExtensionInstallationEvent) {
		let data: SerializedExtensionInstallationEvent;
		switch (event.type) {
			case 'installed':
				data = {
					...event,
					version: event.version.toString()
				};
				break;
			case 'uninstalled':
				data = event;
				break;
		}
		this.broadcastUpdate('extensionInstallationChanged', data);
	}
	public notificationPreferenceChanged(preference: NotificationPreference) {
		this.broadcastUpdate('notificationPreferenceChanged', preference);
	}
	public setTitle(title: string) {
		window.document.title = title;
	}
	public updateAvailable(version: SemanticVersion) {
		this.broadcastUpdate('updateAvailable', version.toString());
	}
	public userSignedIn(profile: WebAppUserProfile) {
		// support legacy api for the initial release
		this.broadcastUpdate(
			'userSignedIn',
			{
				...profile.userAccount,
				...profile
			}
		);
	}
	public userSignedOut() {
		this.broadcastUpdate('userSignedOut');
	}
	public userUpdated(user: UserAccount) {
		this.broadcastUpdate('userUpdated', user);
	}
}