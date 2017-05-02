import * as React from 'react';
import logo from '../svg/logo';
import { Link } from 'react-router';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import DialogManager from './DialogManager';
import AccountManager from './AccountManager';
import ReadReadinessBar from './ReadReadinessBar';

export default class MainView extends PureContextComponent<{}, {}> {
	constructor(props: {}, context: Context) {
		super(props, context);
	}
	public componentDidMount() {
		this.context.pageTitle.addListener('change', this.forceUpdate);
	}
	public componentWillUnmount() {
		this.context.pageTitle.removeListener('change', this.forceUpdate);
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
					<h2>{this.context.pageTitle.get()}</h2>
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