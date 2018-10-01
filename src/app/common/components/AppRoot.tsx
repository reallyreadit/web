import * as React from 'react';
import AppAuthScreen from './AppRoot/AppAuthScreen';
import AppHeader from './AppRoot/AppHeader';
import Toaster from './Toaster';
import EmailConfirmationBar from './EmailConfirmationBar';
import AppNav from './AppRoot/AppNav';
import Root, { Screen, Props as RootProps } from './Root';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from './DialogManager';
import { clientTypeKey as clientTypeQsKey } from '../queryString';

export default class extends Root {
	constructor(props: RootProps) {
		super(props);
		let
			dialog: React.ReactNode,
			screens: Screen[];
		if (props.initialUser) {
			const locationState = this.getLocationState(props.initialLocation);
			dialog = locationState.dialog;
			screens = [locationState.screen];
		} else {
			dialog = null;
			screens = [];
		}
		this.state = {
			dialog,
			screens,
			toasts: [],
			user: props.initialUser
		};
	}
	private handleUserChange(userAccount: UserAccount) {
		if (userAccount) {
			const locationState = this.getLocationState({
				path: window.location.pathname,
				queryString: window.location.search
			});
			if (window.location.search) {
				this.clearQueryStringKvps();
			}
			this.setState({
				dialog: locationState.dialog,
				screens: [locationState.screen],
				user: userAccount
			});
		} else {
			this.setState({
				screens: [],
				user: null
			});
		}
	}
	protected createAccount(name: string, email: string, password: string, captchaResponse: string) {
		return super
			.createAccount(name, email, password, captchaResponse)
			.then(userAccount => {
				this.handleUserChange(userAccount);
				return userAccount;
			});
	}
	protected signIn(email: string, password: string) {
		return super
			.signIn(email, password)
			.then(userAccount => {
				this.handleUserChange(userAccount);
				return userAccount;
			});
	}
	protected signOut() {
		return super
			.signOut()
			.then(() => {
				this.handleUserChange(null);
			});
	}
	public componentDidMount() {
		this.clearQueryStringKvps([clientTypeQsKey]);
	}
	public render() {
		const title = this.state.screens.length ?
			this.state.screens[this.state.screens.length - 1].title :
			null;
		return (
			<div className="app-root">
				{this.state.user ?
					[
						<EmailConfirmationBar
							key="emailConfirmationBar"
							onResendConfirmationEmail={this._resendConfirmationEmail}
							user={this.state.user}
						/>,
						<AppHeader
							key="appHeader"
							onBack={this._popScreen}
							title={title}
						/>,
						<ol
							className="screens"
							key="screens"
						>
							{this.state.screens.map(screen => (
								<li key={screen.key}>
									{screen.render()}
								</li>
							))}
						</ol>,
						<AppNav
							items={this.getNavItems()}
							key="nav"
						/>,
						<DialogManager
							dialog={this.state.dialog}
							key="dialogs"
						/>
					] :
					<AppAuthScreen
						captcha={this.props.captcha}
						onCreateAccount={this._createAccount}
						onShowToast={this._addToast}
						onSignIn={this._signIn}
					/>}
				<Toaster
					onRemoveToast={this._removeToast}
					toasts={this.state.toasts}
				/>
			</div>
		);
	}
}