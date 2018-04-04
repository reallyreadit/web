import * as React from 'react';
import Button from '../../../../../common/components/Button';
import SignInDialog from '../../SignInDialog';
import CreateAccountDialog from '../../CreateAccountDialog';
import Context, { contextTypes } from '../../../Context';

export enum Error {
    IncompatibleBrowser,
    ExtensionNotInstalled,
    SignedOut
}
export default class ReadReadinessDialog extends React.PureComponent<{
    error: Error,
    articleUrl: string
}, {}> {
    public static contextTypes = contextTypes;
    public context: Context;
    private _closeDialog = () => this.context.page.closeDialog();
    private _installExtension = (e: React.MouseEvent<HTMLAnchorElement>) => chrome.webstore.install();
    private _showSignInDialog = () => {
        this._closeDialog();
        this.context.page.openDialog(React.createElement(SignInDialog));
    };
    private _showCreateAccountDialog = () => {
        this._closeDialog();
        this.context.page.openDialog(React.createElement(CreateAccountDialog));
    };
    public render() {
        let message: JSX.Element;
        switch (this.props.error) {
            case Error.IncompatibleBrowser:
                message = <span>You must use Chrome (on Mac or PC) to get credit for really reading.</span>;
                break;
            case Error.ExtensionNotInstalled:
                message = <span>You won't get credit for really reading until you <a onClick={this._installExtension}>add the Chrome extension</a>.</span>;
                break;
            case Error.SignedOut:
                message = <span>You won't get credit for really reading until you <a onClick={this._showSignInDialog}>sign in</a> or <a onClick={this._showCreateAccountDialog}>create an account</a>.</span>;
                break;    
        }
        return (
            <div className="read-readiness-dialog">
                <h3>Wait!</h3>
                {message}
                <div className="continue">
                    <a href={this.props.articleUrl} onClick={this._closeDialog}>That's OK, take me to the article anyway.</a>   
                </div>
                <div className="buttons">
                    <Button text="Cancel" onClick={this._closeDialog} />
                </div>
            </div>
        );
    }
}