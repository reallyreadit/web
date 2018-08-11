import * as React from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
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

export default class MainView extends React.Component<{}, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => {
		this.forceUpdate()
	};
	private _unregisterHistoryListener: () => void;
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
			this.context.environment.clientType === ClientType.Browser || this.context.user.isSignedIn ?
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
						<footer>
							<a href="https://blog.reallyread.it">Blog</a>
							<Separator />
							<a href="https://blog.reallyread.it/beta/2017/07/12/FAQ.html">FAQ</a>
							<Separator />
							<Link to="/privacy">Privacy Policy</Link>
							<Separator />
							<a href="mailto:support@reallyread.it">support@reallyread.it</a>
						</footer>
					</div>
					<DialogManager />
					<Toaster />
				</div> :
				<div className="main-view">
					<div className="content">
						<AppAuthScreen />
					</div>
				</div>
		);
	}
}