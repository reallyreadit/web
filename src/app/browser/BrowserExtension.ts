import Extension from '../common/Extension';

export default class BrowserExtension extends Extension {
    private _extensionId: string;
    private _isInstalled: boolean;
    constructor(extensionId: string) {
        super();
        this._extensionId = extensionId;
        if (this.isBrowserCompatible()) {
            this.pingExtension();
            window.setInterval(() => this.pingExtension(), 1000);
        } else {
            this._isInstalled = false;
        }
    }
    private pingExtension() {
        chrome.runtime.sendMessage(this._extensionId, 'ping', response => {
            const isInstalled = !!response;
            if (isInstalled !== this._isInstalled) {
                this._isInstalled = isInstalled;
                this.emitEvent('change', isInstalled);
            }
        });
    }
    public isInstalled() {
        return this._isInstalled;
    }
    public isBrowserCompatible() {
        return window.navigator.userAgent.indexOf('Chrome') !== -1;
    }
    public getExtensionId() {
        return this._extensionId;
    }
}