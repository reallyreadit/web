import * as React from 'react';
import Button from './Button';
import PureContextComponent from '../PureContextComponent';
import SignInDialog from './SignInDialog';

export default class ReadReadinessDialog extends PureContextComponent<{
    reason: 'incompatibleBrowser' | 'extensionNotInstalled' | 'signedOut',
    articleUrl: string
}, {}> {
    private _closeDialog = () => this.context.page.closeDialog();
    private _installExtension = (e: React.MouseEvent<HTMLAnchorElement>) => chrome.webstore.install();
    private _showSignInDialog = () => {
        this._closeDialog();
        this.context.page.openDialog(React.createElement(SignInDialog));
    };
    public render() {
        let message: JSX.Element;
        switch (this.props.reason) {
            case 'incompatibleBrowser':
                message = <span>You gotta use Chrome to install our extension!</span>;
                break;
            case 'extensionNotInstalled':
                message = <span>Click <a onClick={this._installExtension}>here</a> to install the Chrome extension!</span>;
                break;
            case 'signedOut':
                message = <span>Click <a onClick={this._showSignInDialog}>here</a> to sign in!</span>;
                break;    
        }
        return (
            <div className="read-readiness-dialog">
                <h3>One sec!</h3>
                <h3>Make sure you're ready to read before continuing:</h3>
                {message}
                <div className="continue">
                    <a href={this.props.articleUrl} onClick={this._closeDialog} target="_blank">That's OK, take me to the article anyway.</a>   
                </div>
                <div className="buttons">
                    <Button text="Cancel" onClick={this._closeDialog} />
                </div>
            </div>
        );
    }
}