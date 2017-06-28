import * as React from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import ContextComponent from '../ContextComponent';
import DialogManager from './DialogManager';
import ReadReadinessBar from './ReadReadinessBar';
import Icon from '../../../common/components/Icon';
import Toaster from './Toaster';
import * as className from 'classnames';
import Separator from '../../../common/components/Separator';
import Header from './MainView/Header';
import routes from '../routes';

export default class MainView extends ContextComponent<{}, {}> {
	private _reloadPage = () => this.context.page.reload();
	public componentDidMount() {
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
				<ReadReadinessBar />
				<Toaster />
				<Header />
				<h2 className={className({
					'reloadable': this.context.page.isReloadable,
					'loading': this.context.page.isLoading
				})}>
					<span className="text">{this.context.page.title}</span>
					{this.context.page.isReloadable ?
						<Icon name="refresh" onClick={this._reloadPage} /> :
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
				<DialogManager />
			</div>
		);
	}
}