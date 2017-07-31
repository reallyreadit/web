import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import PureContextComponent from '../PureContextComponent';

export default class AboutPage extends PureContextComponent<RouteComponentProps<{}>, {}> {
	public componentWillMount() {
		this.context.page.setState({
			title: 'About',
			isLoading: false,
			isReloadable: false
		});
	}
	public render() {
		return (
			<div className="about-page copy-page">
				<p>
					<strong>The problem with the internet is that nobody <em>really</em> reads.</strong>
				</p>
				<p>
					<strong>We are a community of people who believe that real reading matters.</strong> We don't allow skimming, scanning, or any other type of pseudo-reading. Reading happens when you take in <em>all</em> the words, in a row, from top to bottom. It's a lot harder than bouncing from headline to headline, but it's also a lot more rewarding.
				</p>
				<p>
					<strong>We believe that commenting should be a privilege, not a right.</strong> So we built a better comments section. It prevents people from commenting on stuff they haven't really read.
				</p>
				<p>
					<strong>Give it a try.</strong> Anybody can use our technology and join our community. We'll see you in the comments section! Sincerely, Bill &amp; Jeff
				</p>
			</div>
		);
	}
}