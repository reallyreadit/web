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
					Echo chambers. Fake news. Trolls. The nagging suspicion that commenting online is like screaming into a void. We’re afraid to admit it, but we know it’s true: The internet is destroying our souls and making us stupid.
				</p>
				<p>
					In March of 2016, we began to envision a way to improve the worst part of the internet--the comments section. The problem is that nobody takes the time to really read. We bounce from headline to headline and leave a meaningless pile of upvotes and shares in our wake. It feels shallow and empty because it is. As humans, we long to better understand and be better understood.
				</p>
				<p>
					reallyread.it improves the quality of online discussion by strictly enforcing one simple rule: we don’t allow comments from people who haven’t really read whatever is being discussed. We believe that commenting should be a privilege, not a right, and that reading something from start to finish is an appropriate baseline expectation.
				</p>
				<p>
					We’re still in beta, but you can join a conversation right now. We welcome your participation and feedback.
				</p>
				<p>
					-Bill &amp; Jeff
				</p>
			</div>
		);
	}
}