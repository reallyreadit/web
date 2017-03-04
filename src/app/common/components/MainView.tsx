import * as React from 'react';
import logo from '../templates/logo';
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
				<header>
					<Link to="/">
						<div className="logo" dangerouslySetInnerHTML={{ __html: logo() }}></div>				
					</Link>
					<h1>
						<Link to="/">reallyread.it</Link>
					</h1>
					<AccountManager />
				</header>
				<h2>{this.context.pageTitle.get()}</h2>
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