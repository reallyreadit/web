import ExtensionApi, { Params } from '../common/ExtensionApi';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import UserAccount from '../../common/models/UserAccount';
import ContentScriptMessagingContext from '../../common/ContentScriptMessagingContext';
import { Message } from '../../common/MessagingContext';
import ExtensionInstallationEvent from '../../common/ExtensionInstallationEvent';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';
import SemanticVersion from '../../common/SemanticVersion';
import * as Cookies  from 'js-cookie';
import { extensionVersionCookieKey } from '../../common/cookies';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import { SubscriptionStatus } from '../../common/models/subscriptions/SubscriptionStatus';

export default class extends ExtensionApi {
    private readonly _contentScriptMessagingContext: ContentScriptMessagingContext;
    private _hasEstablishedCommunication = false;
    private readonly _messageQueue: Message[] = [];
    constructor(params?: Params) {
        super(params);
        // set up new content script messaging listeners regardless of installation
        // status so that we'll be ready when the script is injected
        this._contentScriptMessagingContext = new ContentScriptMessagingContext({
            localId: 'com.readup.web.app.client',
            remoteId: 'com.readup.web.extension.content-scripts.web-app'
        });
        this._contentScriptMessagingContext.addListener(
            (message, sendResponse) => {
                switch (message.type) {
                    case 'articlePosted':
                        this.emitEvent('articlePosted', message.data);
                        break;
                    case 'articleUpdated':
                        this.emitEvent('articleUpdated', message.data);
                        break;
                    case 'commentPosted':
                        this.emitEvent('commentPosted', message.data);
                        break;
                    case 'commentUpdated':
                        this.emitEvent('commentUpdated', message.data);
                        break;
                    case 'displayPreferenceChanged':
                        this.emitEvent('displayPreferenceChanged', message.data);
                        break;
                    case 'initialize':
                        // set communication established
                        this._hasEstablishedCommunication = true;
                        // check installation status
                        if (!this.isInstalled) {
                            // update install status
                            this.changeInstallationStatus(new SemanticVersion(message.data?.version || '3.3.0'));
                        }
                        // flush queue
                        while (this._messageQueue.length) {
                            const message = this._messageQueue.shift();
                            this.sendMessage(message.type, message.data);
                        }
                        break;
                    case 'userUpdated':
                        this.emitEvent('userUpdated', message.data);
                        break;
                }
            }
        );
    }
    private changeInstallationStatus(installedVersion: SemanticVersion | null) {
        // set the local variable
        this._installedVersion = installedVersion;
        // make sure cookie is set properly
        if (this._extensionVersionCookieAttributes) {
            const extensionVersionCookie = Cookies.get(extensionVersionCookieKey);
            if (installedVersion && !extensionVersionCookie) {
                Cookies.set(
                    extensionVersionCookieKey,
                    installedVersion.toString(),
                    {
                        ...this._extensionVersionCookieAttributes,
                        expires: 365
                    }
                );
            } else if (!installedVersion && extensionVersionCookie) {
                Cookies.remove(
                    extensionVersionCookieKey,
                    this._extensionVersionCookieAttributes
                );
            }
        }
        // emit event
        this.emitEvent('installationStatusChanged', installedVersion);
    }
    private sendMessage(type: string, data?: { }) {
        if (!this.isInstalled) {
            return;
        }
        if (this._hasEstablishedCommunication) {
            this._contentScriptMessagingContext.sendMessage(
                {
                    type,
                    data
                }
            );
        } else {
            this._messageQueue.push({
                type,
                data
            });
        }
    }
    public articleUpdated(event: ArticleUpdatedEvent) {
        this.sendMessage('articleUpdated', event);
    }
    public authServiceLinkCompleted(response: AuthServiceBrowserLinkResponse) {
        this.sendMessage('authServiceLinkCompleted', response);
    }
    public commentPosted(comment: CommentThread) {
        this.sendMessage('commentPosted', comment);
    }
    public commentUpdated(comment: CommentThread) {
        this.sendMessage('commentUpdated', comment);
    }
    public displayPreferenceChanged(preference: DisplayPreference) {
        this.sendMessage('displayPreferenceChanged', preference);
    }
    public extensionInstallationEventReceived(event: ExtensionInstallationEvent) {
        if (this.isInstalled && event.type === 'uninstalled') {
            // set communication not established
            this._hasEstablishedCommunication = false;
            // update install status
            this.changeInstallationStatus(null);
        } else if (!this.isInstalled && event.type === 'installed') {
            // update install status
            this.changeInstallationStatus(event.version);
        }
    }
	public subscriptionStatusChanged(status: SubscriptionStatus) {
		this.sendMessage('subscriptionStatusChanged', status);
	}
    public userSignedIn(profile: WebAppUserProfile) {
        this.sendMessage('userSignedIn', profile);
    }
    public userSignedOut() {
        this.sendMessage('userSignedOut');
    }
    public userUpdated(user: UserAccount) {
        this.sendMessage('userUpdated', user);
    }
}