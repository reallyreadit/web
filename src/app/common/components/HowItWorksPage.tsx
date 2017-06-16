import * as React from 'react';
import PureContextComponent from '../PureContextComponent';

export default class HowItWorksPage extends PureContextComponent<{}, {}> {
	public componentWillMount() {
		this.context.page.setState({
			title: 'How It Works',
			isLoading: false,
			isReloadable: false
		});
	}
	public render() {
		return (
			<div className="how-it-works-page copy-page">
				<p>
					First, add the Chrome extension. You only have to do this once.
				</p>
				<p>
					Next, sign up or login on reallyread.it.
				</p>
				<p>
					Great. You’re ready to read!
				</p>
				<p>
					Read anything on the internet. You can check your personal progress by viewing your Reading List, which nobody else can see.
				</p>
				<p>
					Start a new thread by commenting on anything, or join any conversation from the list of Hot Topics on our homepage. Have fun!
				</p>
			</div>
		);
	}
}