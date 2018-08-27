import * as React from 'react';
import { Route } from 'react-router';
import Context, { contextTypes } from '../Context';
import DialogManager from './MainView/DialogManager';
import ReadReadinessBar from './MainView/ReadReadinessBar';
import Toaster from './MainView/Toaster';
import Header from './MainView/Header';
import routes from '../routes';
import SignInDialog from './SignInDialog';
import CreateAccountDialog from './CreateAccountDialog';
import ResetPasswordDialog from './MainView/ResetPasswordDialog';
import EmailConfirmationBar from './MainView/EmailConfirmationBar';
import ClientType from '../ClientType';
import AppAuthScreen from './MainView/AppAuthScreen';
import { Intent } from '../Page';
import Footer from './MainView/Footer';

export default class MainView extends React.Component<{}, {
	showAppAuthScreen: boolean
}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private _unregisterHistoryListener: () => void;
	private readonly _createAccount = (name: string, email: string, password: string, captchaResponse: string) => {
		return this.context.api
			.createUserAccount(name, email, password, captchaResponse)
			.then(userAccount => {
				this.context.user.signIn(userAccount);
				this.context.page.showToast('Welcome to reallyread.it!\nPlease check your email and confirm your address.', Intent.Success);
				ga('send', {
					hitType: 'event',
					eventCategory: 'UserAccount',
					eventAction: 'create',
					eventLabel: userAccount.name
				});
			});
	};
	private readonly _showToast = (text: string, intent: Intent) => {
		this.context.page.showToast(text, intent);
	};
	private readonly _signIn = (email: string, password: string) => {
		return this.context.api
			.signIn(email, password)
			.then(userAccount => {
				this.context.user.signIn(userAccount);
			});
	};
	private readonly _handleSignIn = () => {
		if (this.state.showAppAuthScreen) {
			this.setState({ showAppAuthScreen: false });
		}
	};
	private readonly _handleSignOut = () => {
		if (this.context.environment.clientType === ClientType.App) {
			this.setState({ showAppAuthScreen: true });
		}
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			showAppAuthScreen: (
				this.context.environment.clientType === ClientType.App &&
				!this.context.user.isSignedIn
			)
		};
	}
	public componentWillMount() {
		switch (this.context.router.route.location.search) {
			case '?sign-in':
				this.context.page.openDialog(<SignInDialog />);
				break;
			case '?create-account':
				this.context.page.openDialog(<CreateAccountDialog />);
				break;
			default:
				if (this.context.router.route.location.search.startsWith('?reset-password')) {
					const kvps = this.context.router.route.location.search.split('&');
					this.context.page.openDialog(
						<ResetPasswordDialog
							email={decodeURIComponent(kvps[1].split('=')[1])}
							token={decodeURIComponent(kvps[2].split('=')[1])}
						/>
					);
				}
				break;
		}
	}
	public componentDidMount() {
		const search = this.context.router.route.location.search;
		if (
			search &&
			(
				search === '?sign-in' ||
				search === '?create-account' ||
				search.startsWith('?reset-password')
			)
		) {
			this.context.router.history.push(this.context.router.route.location.pathname);
		}
		this.context.user
			.addListener('signIn', this._handleSignIn)
			.addListener('signOut', this._handleSignOut);
		this._unregisterHistoryListener = this.context.router.history.listen(location => {
			ga('set', 'page', location.pathname);
			ga('send', 'pageview');
		});
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signIn', this._handleSignIn)
			.removeListener('signOut', this._handleSignOut);
		this._unregisterHistoryListener();
	}
	public render() {
		return (
			<div className="main-view">
				{this.state.showAppAuthScreen ?
					<AppAuthScreen
						captcha={this.context.captcha}
						onCreateAccount={this._createAccount}
						onShowToast={this._showToast}
						onSignIn={this._signIn}
					/> :
					[
						<div className="column" key="bars">
							<ReadReadinessBar />
							<EmailConfirmationBar />
						</div>,
						<Header key="header" />,
						<div className="column" key="main">
							<main>
								{routes.map((route, i) => <Route key={i} {...route} />)}
							</main>
							<Footer />
						</div>,
						<DialogManager key="dialogs" />
					]}
				<Toaster />
			</div>
		);
	}
}