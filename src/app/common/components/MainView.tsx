import * as React from 'react';
import logoIcon from '../svg/logoIcon';
import logoText from '../../../common/svg/logoText';
import { Link } from 'react-router';
import PureContextComponent from '../PureContextComponent';
import DialogManager from './DialogManager';
import AccountManager from './AccountManager';
import ReadReadinessBar from './ReadReadinessBar';
import Icon from '../../../common/components/Icon';
import Toaster from './Toaster';
import * as className from 'classnames';

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
				<nav>
					<div className="left-col">
						<Link to="/" className="logo" dangerouslySetInnerHTML={{ __html: logoIcon }}></Link>
						<h1>
							<Link to="/" dangerouslySetInnerHTML={{ __html: logoText }}></Link>
						</h1>
					</div>
					<div className="right-col">
						<AccountManager />
					</div>
				</nav>
				<header>
					<h2 className={className({
						'reloadable': this.context.page.isReloadable,
						'loading': this.context.page.isLoading
					})}>
						<span className="text">{this.context.page.title}</span>
						{this.context.page.isReloadable ?
							<Icon name="refresh" onClick={this._reloadPage} /> :
							null}
					</h2>
				</header>
				<main>
					{this.props.children}
				</main>
				<footer>
					<Link to="/about">About reallyread.it</Link>
				</footer>
				<DialogManager />
			</div>
		);
	}
}