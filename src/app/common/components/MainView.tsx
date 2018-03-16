import * as React from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import Context, { contextTypes } from '../Context';
import DialogManager from './MainView/DialogManager';
import ReadReadinessBar from './MainView/ReadReadinessBar';
import Icon from '../../../common/components/Icon';
import Toaster from './MainView/Toaster';
import * as className from 'classnames';
import Separator from '../../../common/components/Separator';
import Header from './MainView/Header';
import routes from '../routes';
import SignInDialog from './SignInDialog';
import CreateAccountDialog from './CreateAccountDialog';
import ResetPasswordDialog from './MainView/ResetPasswordDialog';
import EmailConfirmationBar from './MainView/EmailConfirmationBar';

export default class MainView extends React.Component<{}, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => this.forceUpdate();
	private _reloadPage = () => this.context.page.reload();
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
		this.context.page.addListener('change', this._forceUpdate);
		this.context.router.history.listen(location => {
			ga('set', 'page', location.pathname);
			ga('send', 'pageview');
		});
	}
	public componentWillUnmount() {
		this.context.page.removeListener('change', this._forceUpdate);
	}
	public render() {
		return (
			<div className="main-view">
				<DialogManager />
				<Toaster />
				<div className="scroll-container">
					<div className="scroll-content">
						<ReadReadinessBar />
						<EmailConfirmationBar />
						<Header />
						<h2 className={className({
							'reloadable': this.context.page.isReloadable,
							'loading': this.context.page.isLoading
						})}>
							<span className="text">{this.context.page.title}</span>
							{this.context.page.isReloadable ?
								<Icon
									name="refresh"
									title="Refresh"
									onClick={this._reloadPage}
								/> :
								null}
						</h2>
						<main>
							{routes.map((route, i) => <Route key={i} {...route} />)}
						</main>
						<footer>
							<a href="http://blog.reallyread.it">Blog</a>
							<Separator />
							<Link to="/privacy">Privacy Policy</Link>
							<Separator />
							<a href="mailto:support@reallyread.it">support@reallyread.it</a>
						</footer>
					</div>
				</div>
			</div>
		);
	}
}