import * as React from 'react';
import AppAuthScreen from './AppRoot/AppAuthScreen';
import AppHeader from './AppRoot/AppHeader';
import Toaster from './Toaster';
import EmailConfirmationBar from './EmailConfirmationBar';
import AppNav from './AppRoot/AppNav';
import Root, { Screen, Props } from './Root';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from './DialogManager';
import { clientTypeQueryStringKey } from '../../../common/routing/queryString';
import UserArticle from '../../../common/models/UserArticle';

export default class extends Root {
	constructor(props: Props) {
		super(props);
		let
			dialog: React.ReactNode,
			screens: Screen[];
		if (props.initialUser) {
			const locationState = this.getLocationDependentState(props.initialLocation);
			dialog = locationState.dialog;
			screens = [locationState.screen];
		} else {
			dialog = null;
			screens = [];
		}
		this.state = {
			...this.state,
			dialog,
			screens
		};
	}
	private handleUserChange(userAccount: UserAccount) {
		if (userAccount) {
			const locationState = this.getLocationDependentState({
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
	protected viewComments(article: UserArticle) {
		
	}
	public componentDidMount() {
		this.clearQueryStringKvps([clientTypeQueryStringKey]);
	}
	public render() {
		/*const title = this.state.screens.length ?
			this.state.screens[this.state.screens.length - 1].title :
			null;*/
		const title = '';
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
									{this._screenFactoryMap[screen.key].render()}
								</li>
							))}
						</ol>,
						<AppNav
							items={[]}
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