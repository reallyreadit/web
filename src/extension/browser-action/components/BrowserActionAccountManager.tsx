import * as React from 'react';
import AccountManager from '../../../common/components/AccountManager';

export default class BrowserActionAccountManager extends React.PureComponent<{
	userName: string,
	showNewReplyIndicator: boolean,
	onSignOut: () => void,
	isSigningOut: boolean
}, { }> {
	private _openInNewTab = (path: string) => window.open(`${config.web.protocol}://${config.web.host}${path}`, '_blank');
	private _showSignInDialog = () => this._openInNewTab('');
	private _showCreateAccountDialog = () => this._openInNewTab('');
	private _goToInbox = () => this._openInNewTab('/inbox');
	private _goToReadingList = () => this._openInNewTab('/list');
	private _goToSettings = () => this._openInNewTab('/settings');
	public state = { isSigningOut: false };
	public render() {
		return (
			<AccountManager
				userName={this.props.userName}
				showNewReplyIndicator={this.props.showNewReplyIndicator}
				isSigningOut={this.state.isSigningOut}
				onSignIn={this._showSignInDialog}
				onSignOut={this.props.onSignOut}
				onCreateAccount={this._showCreateAccountDialog}
				onGoToInbox={this._goToInbox}
				onGoToReadingList={this._goToReadingList}
				onGoToSettings={this._goToSettings}
			/>
		);
	}
}