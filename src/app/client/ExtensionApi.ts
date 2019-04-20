import ExtensionApi from '../common/ExtensionApi';
import NewReplyNotification from '../../common/models/NewReplyNotification';

export default class extends ExtensionApi {
    private _isInstalled: boolean | null = null;
    constructor(extensionId: string) {
        super(extensionId);
        this.sendMessageAwaitingResponse('ping')
            .then(response => {
                const isInstalled = !!response;
                this._isInstalled = isInstalled;
                this.emitEvent('change', isInstalled);
            })
            .catch(() => {
                this._isInstalled = false;
                this.emitEvent('change', false);
            });
        window.addEventListener('message', e => {
            if (e.source === window) {
                const message = JSON.parse(e.data) as { type: string, data: any };
                switch (message.type) {
                    case 'extensionInstalled':
                        if (!this._isInstalled) {
                            this._isInstalled = true;
                            this.emitEvent('change', true);
                        }
                        break;
                    case 'articleUpdated':
                        this.emitEvent('articleUpdated', message.data);
                        break;
                    case 'commentPosted':
                        this.emitEvent('commentPosted', message.data);
                        break;
                }
            }
        });
    }
    private sendMessage<T>(type: string, data?: {}, responseCallback?: (data: T) => void) {
        if (this.isBrowserCompatible) {
            try {
                window.chrome.runtime.sendMessage(this._extensionId, { type, data }, responseCallback);
                return true;
            } catch (ex) { }
        }
        return false;
    }
    private sendMessageAwaitingResponse<T>(type: string, data?: {}) {
        return new Promise<T>((resolve, reject) => {
            if (!this.sendMessage(type, data, resolve)) {
                reject('NotSupported');
            }
        });
    }
    public install() {
        window.open('https://chrome.google.com/webstore/detail/reallyreadit/mkeiglkfdfamdjehidenkklibndmljfi', '_blank');
    }
    public updateNewReplyNotification(notification: NewReplyNotification) {
        this.sendMessage('updateNewReplyNotification', notification);
    }
    public get isInstalled() {
        return this._isInstalled;
    }
    public get isBrowserCompatible() {
        return (
            /^(linux|mac|win)/i.test(window.navigator.platform) &&
            window.navigator.userAgent.indexOf('Android') === -1 &&
            window.navigator.vendor === 'Google Inc.'
        );
    }
}