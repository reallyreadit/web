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
import HeaderButton from './Header/HeaderButton';

type button = 'about' | 'community' | 'history' | 'pizza' | 'starred';
const pathStateMap: {
	path: string,
	button: button,
	subtitle?: string
}[] = [
	{
		path: '/',
		button: 'community',
		subtitle: 'The top articles and stories that our community is reading and commenting on.'
	},
	{
		path: '/starred',
		button: 'starred',
		subtitle: 'Add stars to things you want to save for later.'
	},
	{
		path: '/history',
		button: 'history',
		subtitle: 'Your reading history is private.'
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
function getPathState(path: string) {
	const match = pathStateMap.find(entry => entry.path === path);
	if (match) {
		return {
			selectedButton: match.button,
			subtitle: match.subtitle
		};
	}
	return {
		selectedButton: null,
		subtitle: null
	};
}
export default class extends React.PureComponent<{}, {
	selectedButton: button | null,
	subtitle: string | null,
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
			...getPathState(context.router.route.location.pathname),
			isSigningOut: false
		};
	}
	public componentDidMount() {
		this._unregisterHistoryListener = this.context.router.history.listen(location => {
			this.setState(getPathState(location.pathname));
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
		const aboutButton = (
			<HeaderButton
				to="/about"
				selected={this.state.selectedButton === 'about'}
				className="about"
			>
				About
			</HeaderButton>
		);
		return (
			<header className="header">
				<div className={className('row', 'top', { 'unauthenticated': !this.context.user.isSignedIn })}>
					<div className="content">
						<Link to="/" className="logo" dangerouslySetInnerHTML={{ __html: logoText }}></Link>
						<div className="nav-section">
							{aboutButton}
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
									<HeaderButton
										key="signIn"
										onClick={this._showSignInDialog}
									>
										Log In
									</HeaderButton>,
									<HeaderButton
										key="createAccount"
										onClick={this._showCreateAccountDialog}
										loud
									>
										Sign Up
									</HeaderButton>
								]}
						</div>
					</div>
				</div>
				<div className="row bottom">
					<div className="content">
						<div className="section left">
							{this.state.subtitle ?
								<div className="subtitle">
									{this.state.subtitle}
								</div> :
								null}
							<div className="nav-buttons">
								<HeaderButton to="/" selected={this.state.selectedButton === 'community'}>Community</HeaderButton>
								{this.context.user.isSignedIn ?
									[
										<HeaderButton
											key="starred"
											to="/starred"
											selected={this.state.selectedButton === 'starred'}
										>
											Starred
										</HeaderButton>,
										<HeaderButton
											key="history"
											to="/history"
											selected={this.state.selectedButton === 'history'}
										>
											History
										</HeaderButton>
									] :
									null}
							</div>
						</div>
						<div className="section right">
							{aboutButton}
							<div className="nav-separator"></div>
							<HeaderButton to="/pizza" selected={this.state.selectedButton === 'pizza'}>🍕 Pizza Challenge</HeaderButton>
						</div>
					</div>
				</div>
				{this.state.subtitle ?
					<div className="row subtitle">
						<div className="content">
							<span>{this.state.subtitle}</span>
						</div>
					</div> :
					null}
			</header>
		);
	}
}