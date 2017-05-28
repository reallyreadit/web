import * as React from 'react';
import PureContextComponent from '../PureContextComponent';

export default class AboutPage extends PureContextComponent<{}, {}> {
	public componentWillMount() {
		this.context.page.setState({
			title: 'About reallyread.it',
			isLoading: false
		});
	}
	public render() {
		return (
			<div className="about-page">
				<p>
					<strong>The internet kind of sucks.</strong> Echo chambers. Fake news. Trolls. The nagging suspicion that we’re screaming into a void.
				</p>
				<p>
					Reallyread.it allows you to talk to other people who have really read the same articles that you’ve really read. And, more importantly, we block everyone else.
				</p>
				<p>
					<strong>All voices are not created equal.<br />
					Commenting is a privilege, not a right.</strong>
				</p>
				To get started:
				<ul>
					<li>Create an account</li>
					<li>Download the extension</li>
					<li>Your reading history is saved (privately!) on reallyread.it and you can join in on conversations about the articles and stories you’ve really read.</li>
				</ul>
			</div>
		);
	}
}