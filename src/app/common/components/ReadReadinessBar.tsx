import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';

export default class ReadReadinessBar extends PureContextComponent<{}, {}> {
    private _installExtension = (e: React.MouseEvent<HTMLAnchorElement>) => chrome.webstore.install();
    constructor(props: {}, context: Context) {
        super(props, context);
        if (context.environment === 'browser') {
            context.extension.addListener('change', this.forceUpdate);
        }
    }
    public render() {
        return (
            this.context.environment === 'browser' ?
                this.context.extension.isInstalled() === false ?
                    <div className="read-readiness-bar">
                        {this.context.extension.isBrowserCompatible() ?
                            <span>Click <a onClick={this._installExtension}>here</a> to install the Chrome extension!</span> :
                            <span>You gotta use Chrome to install our extension!</span>}
                    </div> :
                    null :
                null
        );
    }
}