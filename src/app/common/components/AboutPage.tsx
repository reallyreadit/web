import * as React from 'react';
import PureContextComponent from '../PureContextComponent';

export default class AboutPage extends PureContextComponent<{}, {}> {
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
					<strong>We built a better comments section.</strong> It keeps people from commenting on stuff they haven't read. Because who wants their opinion? Not us.
				</p>
				<p>
					<strong>We believe that commenting should be a privilege, not a right.</strong>
				</p>
				<p>
					<strong>Join the community.</strong> Our beta is open to the public. Using the Chrome extension, community members get credit for things they read from start to finish. You can read anything, anywhere on the internet. Everyone wins when everyone has really read.
				</p>
				<p>
					<strong>Turn off the noise.</strong> Bloggers and publishers can easily embed our technology on their own site. Email us for more information.
				</p>
				<p>
					-Bill &amp; Jeff
				</p>
			</div>
		);
	}
}