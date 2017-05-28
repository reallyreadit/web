import * as React from 'react';
import logo from '../svg/logo';
import { Link } from 'react-router';
import PureContextComponent from '../PureContextComponent';
import DialogManager from './DialogManager';
import AppAccountManager from './AppAccountManager';
import ReadReadinessBar from './ReadReadinessBar';
import Icon from '../../../common/components/Icon';
import Toaster from './Toaster';

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
						<Link to="/" className="logo" dangerouslySetInnerHTML={{ __html: logo }}></Link>
						<div className="info-box">
							<span>A community of readers</span>
						</div>
					</div>
					<div className="right-col">
						<AppAccountManager />
					</div>
				</nav>
				<header>
					<h1>
						<Link to="/">reallyread.it</Link>
					</h1>
					<h2 className={this.context.page.isLoading ? 'loading' : null}>
						<div className="spacer"></div>
						<span className="text">{this.context.page.title}</span>
						<Icon name="refresh" onClick={this._reloadPage} />
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