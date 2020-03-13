import ExtensionApi, { Params } from '../common/ExtensionApi';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import UserAccount from '../../common/models/UserAccount';
import ContentScriptMessagingContext from '../../common/ContentScriptMessagingContext';
import { Message } from '../../common/MessagingContext';

export default class extends ExtensionApi {
    private readonly _contentScriptMessagingContext: ContentScriptMessagingContext;
    private _hasEstablishedCommunication = false;
    private readonly _legacyMessageListener = (e: MessageEvent) => {
        if (e.source === window) {
            try {
                this.handleIncomingMessage(JSON.parse(e.data) as Message);
            } catch {
                // ignore
            }
        }
    };
    private readonly _messageQueue: Message[] = [];
    private readonly _sendContentScriptMessage = <T>(type: string, data?: {}, responseCallback?: (data: T) => void) => {
        this._contentScriptMessagingContext.sendMessage(
            {
                type,
                data
            },
            responseCallback
        );
    };
    private readonly _sendLegacyMessage = <T>(type: string, data?: {}, responseCallback?: (data: T) => void) => {
        window.chrome.runtime.sendMessage(
            {
                type,
                data
            },
            responseCallback
        );
    };
    private _sendMessage: <T>(type: string, data?: {}, responseCallback?: (data: T) => void) => void;
    constructor(params: Params) {
        super(params);
        // set up new content script messaging listeners regardless of isInstalled
        // status so that we'll be ready when the script is injected
        this._contentScriptMessagingContext = new ContentScriptMessagingContext({
            localId: 'com.readup.web.app.client',
            remoteId: 'com.readup.web.extension.content-scripts.web-app'
        });
        this._contentScriptMessagingContext.addListener(
            (message, sendResponse) => {
                this.handleIncomingMessage(message);
            }
        );
        this._sendMessage = this._sendContentScriptMessage;
        // isInstalled will be true if extension version >= 3.0.0 is installed
        // if not check for legacy extension
        if (!params.isInstalled) {
            // add legacy listener
            window.addEventListener('message', this._legacyMessageListener);
            // try to ping the legacy extension
            try {
                window.chrome.runtime.sendMessage(
                    this._extensionId,
                    {
                        type: 'ping'
                    },
                    (response: boolean) => {
                        const isInstalled = !!response;
                        if (isInstalled) {
                            // update install status
                            this._isInstalled = isInstalled;
                            this.emitEvent('change', isInstalled);
                            this._hasEstablishedCommunication = true;
                            // fall back to legacy send message
                            this._sendMessage = this._sendLegacyMessage;
                        }
                    }
                );
            } catch {
                // ignore. wait for extension to be installed
            }
        }
    }
    private handleIncomingMessage(message: Message) {
        switch (message.type) {
            // legacy extension message
            case 'extensionInstalled':
                if (!this._isInstalled) {
                    // update install status
                    this._isInstalled = true;
                    this.emitEvent('change', true);
                    this._hasEstablishedCommunication = true;
                    // fall back to legacy send message
                    this._sendMessage = this._sendLegacyMessage;
                }
                break;
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
            case 'initialize':
                // check install status
                if (this._isInstalled) {
                    // flush queue
                    while (this._messageQueue.length) {
                        const message = this._messageQueue.shift();
                        this._sendMessage(message.type, message.data);
                    }
                } else {
                    // update install status
                    this._isInstalled = true;
                    this.emitEvent('change', true);
                }
                // set communication established
                this._hasEstablishedCommunication = true;
                // remove legacy listener and assign content script sender
                window.removeEventListener('message', this._legacyMessageListener);
                this._sendMessage = this._sendContentScriptMessage;
                break;
            case 'userUpdated':
                this.emitEvent('userUpdated', message.data);
                break;
        }
    }
    private sendMessage(type: string, data?: { }) {
        if (this._isInstalled && !this._hasEstablishedCommunication) {
            // queue message for content script initialization
            this._messageQueue.push({
                type,
                data
            });
        } else {
            // just send it. communication has already been established
            // or we're broadcasting using legacy runtime messaging
            this._sendMessage(type, data);
        }
    }
    public articleUpdated(event: ArticleUpdatedEvent) {
        this.sendMessage('articleUpdated', event);
    }
    public commentPosted(comment: CommentThread) {
        this.sendMessage('commentPosted', comment);
    }
    public commentUpdated(comment: CommentThread) {
        this.sendMessage('commentUpdated', comment);
    }
    public extensionUninstalled() {
        if (this._isInstalled) {
            // update install status
            this._isInstalled = false;
            this.emitEvent('change', false);
            this._hasEstablishedCommunication = false;
        }
    }
    public userUpdated(user: UserAccount) {
        this.sendMessage('userUpdated', user);
    }
}