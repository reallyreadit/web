import * as React from 'react';
import { Route } from 'react-router';
import Context, { contextTypes } from '../Context';
import DialogManager from './DialogManager';
import Toaster from './Toaster';
import Header from './MainView/BrowserView/Header';
import routes from '../routes';
import SignInDialog from './BrowserRoot/SignInDialog';
import CreateAccountDialog from './BrowserRoot/CreateAccountDialog';
import ResetPasswordDialog from './ResetPasswordDialog';
import EmailConfirmationBar from './MainView/EmailConfirmationBar';
import ClientType from '../ClientType';
import AppAuthScreen from './MainView/AppView/AppAuthScreen';
import { Intent } from '../Page';
import Footer from './MainView/BrowserView/Footer';
import { parseQueryString } from '../queryString';
import * as className from 'classnames';
import AppHeader from './MainView/AppView/AppHeader';
import AppNav from './MainView/AppView/AppNav';
import { IconName } from '../../../common/components/Icon';
import AppView from './AppRoot';

export enum NavKey {
	Home,
	Starred,
	History,
	Stats
};
export interface NavItem {
	key: NavKey,
	path: string,
	iconName: IconName,
	label: string,
	title?: string
}
const navItems: NavItem[] = [
	{
		key: NavKey.Home,
		path: '/',
		iconName: 'home',
		label: 'Home'
	},
	{
		key: NavKey.Starred,
		path: '/starred',
		iconName: 'star',
		label: 'Starred',
		title: 'Starred'
	},
	{
		key: NavKey.History,
		path: '/history',
		iconName: 'clock',
		label: 'History',
		title: 'History'
	},
	{
		key: NavKey.Stats,
		path: '/stats',
		iconName: 'line-chart',
		label: 'Stats',
		title: 'Stats'
	}
];

function getSelectedNavKeyFromPath(path: string) {
	const match = navItems.find(item => item.path === path);
	return match ? match.key : null;
}
export default class MainView extends React.Component<{}, {
	selectedNavKey: NavKey | null,
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
			selectedNavKey: getSelectedNavKeyFromPath(context.router.route.location.pathname),
			showAppAuthScreen: (
				this.context.environment.clientType === ClientType.App &&
				!this.context.user.isSignedIn
			)
		};
	}
	public componentWillMount() {
		if (this.context.router.route.location.search) {
			const
				kvps = parseQueryString(this.context.router.route.location.search),
				keys = Object.keys(kvps);
			if (keys.includes('sign-in')) {
				this.context.page.openDialog(<SignInDialog />);
			} else if (keys.includes('create-account')) {
				this.context.page.openDialog(<CreateAccountDialog />);
			} else if (keys.includes('reset-password')) {
				this.context.page.openDialog(
					<ResetPasswordDialog
						email={decodeURIComponent(kvps['email'])}
						token={decodeURIComponent(kvps['token'])}
					/>
				);
			}
		}
	}
	public componentDidMount() {
		if (this.context.router.route.location.search) {
			const
				kvps = parseQueryString(this.context.router.route.location.search),
				keys = Object.keys(kvps);
			if (
				keys.includes('sign-in') ||
				keys.includes('create-account') ||
				keys.includes('reset-password')
			) {
				this.context.router.history.push(this.context.router.route.location.pathname);
			}
		}
		this.context.user
			.addListener('signIn', this._handleSignIn)
			.addListener('signOut', this._handleSignOut);
		this._unregisterHistoryListener = this.context.router.history.listen(location => {
			this.setState({ selectedNavKey: getSelectedNavKeyFromPath(location.pathname) });
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
			<div className={className(
				'main-view',
				{ 'flex-flow': inAppMode }
			)}>
				<div className="max-width">
					<EmailConfirmationBar />
				</div>
				<DialogManager />
				<Toaster />
				{
						(inAppMode ?
							 :
							<Header key="header" />),
						<div className="content" key="main">
							<div className="max-width">
								<main>
									{routes.map((route, i) => <Route key={i} {...route} />)}
								</main>
								{!inAppMode ?
									<Footer /> :
									null}
							</div>
						</div>,
						(inAppMode ?
							<AppNav
								key="appNav"
								navItems={navItems}
								selectedNavKey={this.state.selectedNavKey}
							/> :
							null)
					]}
				
			</div>
		);
	}
}