import Extension from '../common/Extension';
import NewReplyNotification from '../../common/models/NewReplyNotification';

export default class BrowserExtension extends Extension {
    private _isInstalled: boolean = null;
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
                switch (e.data.type) {
                    case 'extensionInstalled':
                        if (!this._isInstalled) {
                            this._isInstalled = true;
                            this.emitEvent('change', true);
                        }
                        break;
                }
            }
        });
    }
    private sendMessage<T>(type: string, data?: {}) {
        if (this.isBrowserCompatible()) {
            return new Promise<T>((resolve, reject) => {
                try {
                    chrome.runtime.sendMessage(this._extensionId, { type, data }, resolve);
                } catch (ex) {
                    reject();
                }
            });
        }
        return Promise.reject('NotSupported');
    }
    public isInstalled() {
        return this._isInstalled;
    }
    public isBrowserCompatible() {
        return !!(window.chrome && window.chrome.runtime);
    }
    public updateNewReplyNotification(notification: NewReplyNotification) {
        this.sendMessage('updateNewReplyNotification', notification)
            .catch(() => {});
    }
}