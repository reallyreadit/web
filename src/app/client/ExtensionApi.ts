import ExtensionApi from '../common/ExtensionApi';
import NewReplyNotification from '../../common/models/NewReplyNotification';

export default class extends ExtensionApi {
    private _isInstalled: boolean | null = null;
    constructor(extensionId: string) {
        super(extensionId);
        this.sendMessage('ping')
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
                }
            }
        });
    }
    private sendMessage<T>(type: string, data?: {}) {
        if (this.isBrowserCompatible) {
            return new Promise<T>((resolve, reject) => {
                try {
                    window.chrome.runtime.sendMessage(this._extensionId, { type, data }, resolve);
                } catch (ex) {
                    reject();
                }
            });
        }
        return Promise.reject('NotSupported');
    }
    public install() {
        window.chrome.webstore.install();
    }
    public updateNewReplyNotification(notification: NewReplyNotification) {
        this.sendMessage('updateNewReplyNotification', notification)
            .catch(() => {});
    }
    public get isInstalled() {
        return this._isInstalled;
    }
    public get isBrowserCompatible() {
        return !!(window.chrome && window.chrome.webstore);
    }
}