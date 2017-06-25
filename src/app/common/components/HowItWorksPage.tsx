import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import SignInDialog from './SignInDialog';
import CreateAccountDialog from './CreateAccountDialog';
import { Link } from 'react-router';

export default class HowItWorksPage extends PureContextComponent<{}, {}> {
	private _installExtension = (e: React.MouseEvent<HTMLAnchorElement>) => chrome.webstore.install();
	private _showSignInDialog = () => this.context.page.openDialog(React.createElement(SignInDialog));
	private _showCreateAccountDialog = () => this.context.page.openDialog(React.createElement(CreateAccountDialog));
	public componentWillMount() {
		this.context.page.setState({
			title: 'How It Works',
			isLoading: false,
			isReloadable: false
		});
	}
	public componentDidMount() {
		this.context.user.addListener('authChange', this._forceUpdate);
		this.context.extension.addListener('change', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._forceUpdate);
		this.context.extension.removeListener('change', this._forceUpdate);
	}
	public render() {
		return (
			<div className="how-it-works-page copy-page">
				{this.context.extension.isInstalled() ?
					<p>First, add the Chrome extension. You only have to do this once.</p> :
					<p>First, <a onClick={this._installExtension}>add the Chrome extension</a>. You only have to do this once.</p>}
				{this.context.user.isSignedIn ?
					<p>Next, sign in or create an account.</p> :
					<p>Next, <a onClick={this._showSignInDialog}>sign in</a> or <a onClick={this._showCreateAccountDialog}>create an account</a>.</p>}
				<p>
					Great. You’re ready to go. You can read anything on the internet. 
				</p>
				<p>
					Your {this.context.user.isSignedIn ? <Link to="/list">Reading List</Link> : <span>Reading List</span>} shows what you have read. (Nobody else can see this.)
				</p>
				<p>
					You can comment on any article you've really read. Have fun!
				</p>
			</div>
		);
	}
}