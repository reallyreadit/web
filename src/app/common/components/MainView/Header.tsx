import * as React from 'react';
import { Link } from 'react-router-dom';
import logoText from '../../../../common/svg/logoText';
import UserAccountRole from '../../../../common/models/UserAccountRole';
import Context, { contextTypes } from '../../Context';
import Spinner from '../../../../common/components/Spinner';
import Menu from './Header/Menu';
import SignInDialog from '../SignInDialog';
import CreateAccountDialog from '../CreateAccountDialog';
import * as className from 'classnames';
import { hasNewUnreadReply } from '../../../../common/models/NewReplyNotification';

type button = 'about' | 'community' | 'history' | 'pizza' | 'starred';
const pathButtonMap: {
	path: string,
	button: button
}[] = [
	{
		path: '/',
		button: 'community'
	},
	{
		path: '/starred',
		button: 'starred'
	},
	{
		path: '/history',
		button: 'history'
	},
	{
		path: '/pizza',
		button: 'pizza'
	},
	{
		path: '/about',
		button: 'about'
	}
];
function getSelectedButton(path: string) {
	const match = pathButtonMap.find(entry => entry.path === path);
	if (match) {
		return match.button;
	}
	return null;
}
export default class extends React.PureComponent<{}, {
	selectedButton: button | null,
	isSigningOut: boolean
}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => {
		this.forceUpdate();
	};
	private readonly _preventFocus = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
	};
	private readonly _showSignInDialog = () => {
		this.context.page.openDialog(<SignInDialog />);
	};
	private readonly _showCreateAccountDialog = () => {
		this.context.page.openDialog(<CreateAccountDialog />);
	};
	private readonly _ackNewReplyNotification = () => {
		if (hasNewUnreadReply(this.context.page.newReplyNotification)) {
			this.context.api.ackNewReply();
		}
	};
	private readonly _signOut = () => {
		this.setState({ isSigningOut: true });
		this.context.api.signOut().then(() => {
			this.context.user.signOut();
			this.setState({ isSigningOut: false });
		});
	};
	private _unregisterHistoryListener: () => void | null = null;
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			selectedButton: getSelectedButton(context.router.route.location.pathname),
			isSigningOut: false
		};
	}
	public componentDidMount() {
		this._unregisterHistoryListener = this.context.router.history.listen(location => {
			this.setState({ selectedButton: getSelectedButton(location.pathname) });
		});
		this.context.user.addListener('authChange', this._forceUpdate);
		this.context.page.addListener('newReplyNotificationChange', this._forceUpdate);
	}
	public componentWillUnmount() {
		if (this._unregisterHistoryListener) {
			this._unregisterHistoryListener();
		}
		this.context.user.removeListener('authChange', this._forceUpdate);
		this.context.page.removeListener('newReplyNotificationChange', this._forceUpdate);
	}
	public render() {
		const showNewReplyIndicator = hasNewUnreadReply(this.context.page.newReplyNotification);
		return (
			<header className="header">
				<div className="row top">
					<div className="content">
						<Link to="/" className="logo" dangerouslySetInnerHTML={{ __html: logoText }}></Link>
						<div className="nav-section">
							<Link
								className={className('nav-button', { selected: this.state.selectedButton === 'about' })}
								to="/about"
							>
								<label>About</label>
							</Link>
							<div className="nav-separator"></div>
							{this.context.user.isSignedIn ?
								<Menu
									className={className('nav-button', { indicator: showNewReplyIndicator })}
									buttonContent={[
										this.state.isSigningOut ?
											<Spinner key="spinner" /> :
											null,
										<label key="userName">{this.context.user.userAccount.name}</label>
									]}
									menuContent={[
										this.context.user.userAccount.role === UserAccountRole.Admin ?
											<li key="admin">
												<Link to="/admin" onMouseDown={this._preventFocus}>
													Admin
												</Link>
											</li> :
											null,
										<li key="inbox" className={className({ indicator: showNewReplyIndicator })}>
											<Link to="/inbox" onMouseDown={this._preventFocus} onClick={this._ackNewReplyNotification}>
												Inbox
											</Link>
										</li>,
										<li key="settings">
											<Link to="/settings" onMouseDown={this._preventFocus}>
												Settings
											</Link>
										</li>,
										<li
											key="signOut"
											onClick={this._signOut}
										>
											<span>Log Out</span>
										</li>
									]}
								/> :
								[
									<div
										key="signIn"
										className="nav-button"
										onClick={this._showSignInDialog}
									>
										<label>Log In</label>
									</div>,
									<div
										key="createAccount"
										className="nav-button loud"
										onClick={this._showCreateAccountDialog}
									>
										<label>Sign Up</label>
									</div>
								]}
						</div>
					</div>
				</div>
				<div className="row bottom">
					<div className="content">
						<div className="section left">
							<Link
								className={className('nav-button', { selected: this.state.selectedButton === 'community' })}
								to="/"
							>
								<label>Community</label>
							</Link>
							{this.context.user.isSignedIn ?
								[
									<Link
										key="starred"
										className={className('nav-button', { selected: this.state.selectedButton === 'starred' })}
										to="/starred"
									>
										<label>Starred</label>
									</Link>,
									<Link
										key="history"
										className={className('nav-button', { selected: this.state.selectedButton === 'history' })}
										to="/history"
									>
										<label>History</label>
									</Link>
								] :
								null}
						</div>
						<div className="section right">
							<Link
								className={className('nav-button', { selected: this.state.selectedButton === 'pizza' })}
								to="/pizza"
							>
								<span className="emoji">🍕</span>
								<label>Pizza Challenge</label>
							</Link>
						</div>
					</div>
				</div>
			</header>
		);
	}
}