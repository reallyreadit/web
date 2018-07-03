import * as React from 'react';
import Context, { contextTypes } from '../../Context';
import CreateAccountDialog from '../CreateAccountDialog';
import SignInDialog from '../SignInDialog';
import NavBar from '../../../../common/components/NavBar';
import ActionLink from '../../../../common/components/ActionLink';
import Separator from '../../../../common/components/Separator';
import * as className from 'classnames';
import { hasNewUnreadReply } from '../../../../common/models/NewReplyNotification';
import UserAccountRole from '../../../../common/models/UserAccountRole';
import SpeechBubble from '../../../../common/components/Logo/SpeechBubble';
import DoubleRPathGroup from '../../../../common/components/Logo/DoubleRPathGroup';
import logoText from '../../../../common/svg/logoText';
import Button from '../../../../common/components/Button';
import { Link } from 'react-router-dom';

export default class Header extends React.PureComponent<{}, { isSigningOut: boolean }> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => this.forceUpdate();
	// account dialogs
	private _showSignInDialog = () => this.context.page.openDialog(React.createElement(SignInDialog));
	private _showCreateAccountDialog = () => this.context.page.openDialog(React.createElement(CreateAccountDialog));
	// account nav
	private _goToHome = () => this.context.router.history.push('/');
	private _goToInbox = () => {
		if (hasNewUnreadReply(this.context.page.newReplyNotification)) {
			this.context.api.ackNewReply();
		}
		this.context.router.history.push('/inbox')
	};
	private _goToStarred = () => this.context.router.history.push('/starred');
	private _goToHistory = () => this.context.router.history.push('/history');
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
	private _goToPizza = () => this.context.router.history.push('/pizza');
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
						<Link to="/" className="speech-bubble-link">
							<SpeechBubble>
								<DoubleRPathGroup />
							</SpeechBubble>
						</Link>
						<h1>
							<Link to="/" className="logo-text" dangerouslySetInnerHTML={{ __html: logoText }}></Link>
						</h1>
					</div>
					{this.context.user.isSignedIn ?
						<div className={className('user-controls', { 'signing-out': this.state.isSigningOut })}>
							<span className="user-name">{this.state.isSigningOut ? 'Bye' : 'Hi'}, <strong>{this.context.user.userAccount.name}</strong></span>
							{this.context.user.userAccount.role === UserAccountRole.Admin ?
								[
									<Separator key="0" />,
									<ActionLink key="1" text="Admin" iconLeft="key" onClick={this._goToAdmin} />
								] :
								null}
							<Separator />
							<ActionLink text="Settings" iconLeft="cog" onClick={this._goToSettings} />
							<Separator />
							<ActionLink text="Sign Out" iconLeft="switch" onClick={this._signOut} state={this.state.isSigningOut ? 'busy' : 'normal'} />
						</div> :
						null}
				</div>
				<nav>
					<div className="left-nav">
						<Button text="What We're Reading" iconLeft="book" onClick={this._goToHome} />
						<Button text="About" iconLeft="lightbulb" onClick={this._goToAbout} />
						{this.context.challenge.activeChallenge ?
							<Button
								text="Pizza Challenge"
								contentLeft={'🍕'}
								onClick={this._goToPizza}
							/> :
							null}
					</div>
					<div className="right-nav">
						<NavBar
							isSignedIn={this.context.user.isSignedIn}
							showNewReplyIndicator={hasNewUnreadReply(this.context.page.newReplyNotification)}
							state={this.state.isSigningOut ? 'disabled' : 'normal'}
							onSignIn={this._showSignInDialog}
							onCreateAccount={this._showCreateAccountDialog}
							onGoToInbox={this._goToInbox}
							onGoToStarred={this._goToStarred}
							onGoToHistory={this._goToHistory}
						/>
					</div>
				</nav>
			</header>
		);
	}
}