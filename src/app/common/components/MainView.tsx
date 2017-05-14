import * as React from 'react';
import logo from '../svg/logo';
import { Link } from 'react-router';
import PureContextComponent from '../PureContextComponent';
import DialogManager from './DialogManager';
import AccountManager from './AccountManager';
import ReadReadinessBar from './ReadReadinessBar';

export default class MainView extends PureContextComponent<{}, {}> {
	private _reloadPage = () => this.context.page.reload();
	public componentDidMount() {
		this.context.page.addListener('change', this.forceUpdate);
	}
	public componentWillUnmount() {
		this.context.page.removeListener('change', this.forceUpdate);
	}
	public render() {
		return (
			<div className="main-view">
				<ReadReadinessBar />
				<nav>
					<div className="left-col">
						<Link to="/" className="logo" dangerouslySetInnerHTML={{ __html: logo }}></Link>
					</div>
					<div className="right-col">
						<AccountManager />
					</div>
				</nav>
				<header>
					<h1>
						<Link to="/">reallyread.it</Link>
					</h1>
					<h2 className={this.context.page.isLoading ? 'loading' : null}>
						{this.context.page.title}
						<svg className="icon" onClick={this._reloadPage}><use xlinkHref="#icon-refresh"></use></svg>
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