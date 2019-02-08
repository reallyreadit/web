import * as React from 'react';
import Button from '../../../../common/components/Button';

export enum Error {
	IncompatibleBrowser,
	ExtensionNotInstalled,
	SignedOut
}
export default class ReadReadinessDialog extends React.PureComponent<{
	articleUrl: string,
	error: Error,
	onCloseDialog: () => void,
	onInstallExtension: () => void,
	onShowCreateAccountDialog: () => void,
	onShowSignInDialog: () => void
}, {}> {
	public render() {
		let message: JSX.Element;
		switch (this.props.error) {
			case Error.IncompatibleBrowser:
				message = <span>You must use Chrome (on Mac or PC) to track your reading.</span>;
				break;
			case Error.ExtensionNotInstalled:
				message = <span>You won't be able to track your reading until you <a onClick={this.props.onInstallExtension}>add the Chrome extension</a>.</span>;
				break;
			case Error.SignedOut:
				message = <span>You won't be able to track your reading until you <a onClick={this.props.onShowSignInDialog}>sign in</a> or <a onClick={this.props.onShowCreateAccountDialog}>create an account</a>.</span>;
				break;
		}
		return (
			<div className="read-readiness-dialog_fpap5e">
				<h3>Wait!</h3>
				{message}
				<div className="continue">
					<a href={this.props.articleUrl} onClick={this.props.onCloseDialog}>That's OK, take me to the article anyway.</a>
				</div>
				<div className="buttons">
					<Button text="Cancel" onClick={this.props.onCloseDialog} />
				</div>
			</div>
		);
	}
}