import * as React from 'react';
import { Link } from 'react-router';
import PureContextComponent from '../PureContextComponent';
import DialogManager from './DialogManager';
import ReadReadinessBar from './ReadReadinessBar';
import Icon from '../../../common/components/Icon';
import Toaster from './Toaster';
import * as className from 'classnames';
import Separator from '../../../common/components/Separator';
import Header from './MainView/Header';

export default class MainView extends PureContextComponent<{}, {}> {
	private _reloadPage = () => this.context.page.reload();
	public componentDidMount() {
		this.context.page.addListener('change', this._forceUpdate);
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
					{this.props.children}
				</main>
				<footer>
					<Link to="/privacy">Privacy Policy</Link>
					<Separator />
					<a href="mailto:support@reallyread.it">support@reallyread.it</a>
				</footer>
				<DialogManager />
			</div>
		);
	}
}