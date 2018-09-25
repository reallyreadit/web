import * as React from 'react';
import { Link } from 'react-router-dom';
import logoText from '../../../../common/svg/logoText';
import UserAccountRole from '../../../../common/models/UserAccountRole';
import Spinner from '../../../../common/components/Spinner';
import Menu from './Header/Menu';
import * as className from 'classnames';
import Icon from '../../../../common/components/Icon';
import UserAccount from '../../../../common/models/UserAccount';

interface Props {
	onDismissNewReplyIndicator: () => void,
	onShowCreateAccountDialog: () => void,
	onShowSignInDialog: () => void,
	onSignOut: () => Promise<void>,
	showNewReplyIndicator: boolean,
	user: UserAccount
}
export default class extends React.PureComponent<Props, {
	isSigningOut: boolean
}> {
	private readonly _preventFocus = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
	};
	private readonly _signOut = () => {
		this.setState({ isSigningOut: true });
		this.props
			.onSignOut()
			.then(() => {
				this.setState({ isSigningOut: false });
			})
			.catch(() => {
				this.setState({ isSigningOut: false });
			});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isSigningOut: false
		};
	}
	public render() {
		return (
			<header className="browser-header">
				<div
					className="logo-container"
					dangerouslySetInnerHTML={{ __html: logoText }}
				></div>
				<div className="menu-container">
					{this.props.user ?
						<Menu
							className={className({ indicator: this.props.showNewReplyIndicator })}
							buttonContent={[
								this.state.isSigningOut ?
									<Spinner key="spinner" /> :
									null,
								<label key="userName">{this.props.user.name}</label>,
								<Icon key="hamburger" className="hamburger" name="three-bars" />
							]}
							menuContent={[
								this.props.user.role === UserAccountRole.Admin ?
									<li key="admin">
										<Link to="/admin" onMouseDown={this._preventFocus}>
											Admin
										</Link>
									</li> :
									null,
								<li key="inbox" className={className({ indicator: this.props.showNewReplyIndicator })}>
									<Link to="/inbox" onMouseDown={this._preventFocus} onClick={this.props.onDismissNewReplyIndicator}>
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
							<button
								key="signIn"
								onClick={this.props.onShowSignInDialog}
							>
								Log In
							</button>,
							<button
								key="createAccount"
								onClick={this.props.onShowCreateAccountDialog}
							>
								Sign Up
							</button>
						]}
				</div>
			</header>
		);
	}
}