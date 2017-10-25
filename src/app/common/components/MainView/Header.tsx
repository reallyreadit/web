import * as React from 'react';
import PureContextComponent from '../../PureContextComponent';
import CreateAccountDialog from '../CreateAccountDialog';
import SignInDialog from '../SignInDialog';
import NavBar from '../../../../common/components/NavBar';
import ActionLink from '../../../../common/components/ActionLink';
import Separator from '../../../../common/components/Separator';
import * as className from 'classnames';
import { hasNewUnreadReply } from '../../../../common/models/NewReplyNotification';
import UserAccountRole from '../../../../common/models/UserAccountRole';
import logoIcon from '../../svg/logoIcon';
import logoText from '../../../../common/svg/logoText';
import Button from '../../../../common/components/Button';
import { Link } from 'react-router-dom';

export default class Header extends PureContextComponent<{}, { isSigningOut: boolean }> {
	// account dialogs
	private _showSignInDialog = () => this.context.page.openDialog(React.createElement(SignInDialog));
	private _showCreateAccountDialog = () => this.context.page.openDialog(React.createElement(CreateAccountDialog));
	// account nav
	private _goToInbox = () => {
		if (hasNewUnreadReply(this.context.page.newReplyNotification)) {
			this.context.api.ackNewReply();
		}
		this.context.router.history.push('/inbox')
	};
	private _goToReadingList = () => this.context.router.history.push('/list');
	private _goToSettings = () => this.context.router.history.push('/settings');
	private _goToAdmin = () => this.context.router.history.push('/admin');
	private _signOut = () => {
		this.setState({ isSigningOut: true });
		this.context.api.signOut().then(() => {
			this.setState({ isSigningOut: false });
			this.context.user.signOut();
		});
	};
	// regular nav
	private _goToAbout = () => this.context.router.history.push('/about');
	private _goToHowItWorks = () => this.context.router.history.push('/how-it-works');
	public state = { isSigningOut: false };
	public componentDidMount() {
		this.context.user.addListener('authChange', this._forceUpdate);
		this.context.page.addListener('newReplyNotificationChange', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._forceUpdate);
		this.context.page.removeListener('newReplyNotificationChange', this._forceUpdate);
	}
	public render() {
		return (
			<header className="main-view_header">
				<div className="title">
					<div className="logos">
						<Link to="/" className="logo-icon" dangerouslySetInnerHTML={{ __html: logoIcon }}></Link>
						<h1>
							<Link to="/" className="logo-text" dangerouslySetInnerHTML={{ __html: logoText }}></Link>
						</h1>
					</div>
					{this.context.user.isSignedIn ?
						<div className={className('user-name', { 'signing-out': this.state.isSigningOut })}>
							<span>{this.state.isSigningOut ? 'Bye' : 'Hi'}, <strong>{this.context.user.userAccount.name}</strong></span>
							{this.context.user.userAccount.role === UserAccountRole.Admin ?
								[
									<Separator key="0" />,
									<ActionLink key="1" text="Admin" iconLeft="key" onClick={this._goToAdmin} />
								] :
								null}
							<Separator />
							<ActionLink text="Sign Out" iconLeft="switch" onClick={this._signOut} state={this.state.isSigningOut ? 'busy' : 'normal'} />
						</div> :
						null}
				</div>
				<nav>
					<div className="left-nav">
						<Button text="About" iconLeft="lightbulb" onClick={this._goToAbout} />
						<Button text="How it Works" iconLeft="question" onClick={this._goToHowItWorks} />
					</div>
					<div className="right-nav">
						<NavBar
							isSignedIn={this.context.user.isSignedIn}
							showNewReplyIndicator={hasNewUnreadReply(this.context.page.newReplyNotification)}
							state={this.state.isSigningOut ? 'disabled' : 'normal'}
							onSignIn={this._showSignInDialog}
							onCreateAccount={this._showCreateAccountDialog}
							onGoToInbox={this._goToInbox}
							onGoToReadingList={this._goToReadingList}
							onGoToSettings={this._goToSettings}
						/>
					</div>
				</nav>
			</header>
		);
	}
}