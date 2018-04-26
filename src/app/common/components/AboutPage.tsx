import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import CreateAccountDialog from './CreateAccountDialog';

export default class AboutPage extends React.PureComponent<RouteComponentProps<{}>, {}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => this.forceUpdate();
	private readonly _installExtension = (e: React.MouseEvent<HTMLAnchorElement>) => chrome.webstore.install();
	private readonly _showCreateAccountDialog = () => this.context.page.openDialog(React.createElement(CreateAccountDialog));
	public componentWillMount() {
		this.context.page.setState({
			title: 'About',
			isLoading: false,
			isReloadable: false
		});
	}
	public componentDidMount() {
		this.context.user.addListener('authChange', this._forceUpdate);
		this.context.environment.extension.addListener('change', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._forceUpdate);
		this.context.environment.extension.removeListener('change', this._forceUpdate);
	}
	public render() {
		const
			isSignedIn = this.context.user.isSignedIn,
			isExtensionInstalled = this.context.environment.extension.isInstalled();
		return (
			<div className="about-page">
				<h3>We are on a mission to get people reading on the internet.</h3>
				<ul className="stack-group reading-benefits">
					<li>
						<div className="image brain"></div>
						<span>Reading <strong>makes you smarter</strong>. It’s exercise for your brain.</span>
					</li>
					<li>
						<div className="image books"></div>
						<span>Reading is the best way to <strong>get informed</strong>. Learn to spot bad info. Get context beyond the headlines.</span>
					</li>
					<li>
						<div className="image computer"></div>
						<span>Reading is <strong>fun</strong>. Completing an article - especially a long one! - is an accomplishment worth celebrating.</span>
					</li>
				</ul>
				<h3>Join us!</h3>
				<p>
					The beta community is the backbone of the product experience and the company. Some people comment, many do not. For now, we’re on Chrome only. Mobile app coming soon.
				</p>
				<h4>Features</h4>
				<ul className="stack-group features">
					<li>
						<strong>Stats</strong>
						<span>Track and improve your online reading habits.</span>
					</li>
					<li>
						<strong>Stars</strong>
						<span>Star anything on the internet that you’ll want to read later.</span>
					</li>
					<li>
						<strong>Conversation</strong>
						<span>People can’t comment on articles they haven’t read.</span>
					</li>
				</ul>
				{!isSignedIn || !isExtensionInstalled ?
					<div className="get-started">
						{!isSignedIn ?
							<a onClick={this._showCreateAccountDialog}>Create an account</a> :
							null}
						{!isSignedIn && !isExtensionInstalled ?
							<span> &amp; </span> :
							null}
						{!isExtensionInstalled ?
							<a onClick={this._installExtension}>Add the Chrome extension</a> :
							null}
					</div> :
					null}
				<h3>Our story</h3>
				<div className="our-story">
					<img src="/images/bill-and-jeff.jpg" />
					<p>
						Our pre-school teachers put us together because we didn’t get along with anyone else. We’ve been building products and businesses ever since. Bill studied English at Stanford then worked in startupland. Jeff taught himself how to code. We love pizza, reading, and technology, in that order.
					</p>
				</div>
			</div>
		);
	}
}