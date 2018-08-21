import * as React from 'react';
import { Route } from 'react-router';
import Context, { contextTypes } from '../Context';
import DialogManager from './MainView/DialogManager';
import ReadReadinessBar from './MainView/ReadReadinessBar';
import Toaster from './MainView/Toaster';
import Separator from '../../../common/components/Separator';
import Header from './MainView/Header';
import routes from '../routes';
import SignInDialog from './SignInDialog';
import CreateAccountDialog from './CreateAccountDialog';
import ResetPasswordDialog from './MainView/ResetPasswordDialog';
import EmailConfirmationBar from './MainView/EmailConfirmationBar';
import ClientType from '../ClientType';
import AppAuthScreen from './MainView/AppAuthScreen';
import UserAccount from '../../../common/models/UserAccount';
import { Intent } from '../Page';
import Footer from './MainView/Footer';

export default class MainView extends React.Component<{}, {
	activeMobileScreen: React.Element
}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => {
		this.forceUpdate()
	};
	private _unregisterHistoryListener: () => void;
	private readonly _contextCreateAccount = (userAccount: UserAccount) => {
		this.context.user.signIn(userAccount);
		ga('send', {
			hitType: 'event',
			eventCategory: 'UserAccount',
			eventAction: 'create',
			eventLabel: userAccount.name
		});
		this.forceUpdate();
	};
	private readonly _contextSignIn = (userAccount: UserAccount) => {
		this.context.user.signIn(userAccount);
		this.forceUpdate();
	};
	private readonly _createAccount = (name: string, email: string, password: string, captchaResponse: string) => {
		return this.context.api.createUserAccount(name, email, password, captchaResponse);
	};
	private readonly _setTitle = (title: string) => {
		this.context.page.setTitle(title);
	};
	private readonly _showToast = (text: string, intent: Intent) => {
		this.context.page.showToast(text, intent);
	};
	private readonly _signIn = (email: string, password: string) => {
		return this.context.api.signIn(email, password);
	};
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
		this.context.user.addListener('authChange', this._forceUpdate);
		this._unregisterHistoryListener = this.context.router.history.listen(location => {
			ga('set', 'page', location.pathname);
			ga('send', 'pageview');
		});
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._forceUpdate);
		this._unregisterHistoryListener();
	}
	public render() {
		return (
			<div className="main-view">
				<div className="content">
					<ReadReadinessBar />
					<EmailConfirmationBar />
				</div>
				<Header />
				<div className="content">
					<main>
						{routes.map((route, i) => <Route key={i} {...route} />)}
					</main>
					<Footer />
				</div>
				<AppScreenManager />
				<DialogManager />
				<Toaster />
			</div>
		);
	}
}