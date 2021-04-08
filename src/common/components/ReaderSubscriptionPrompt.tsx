import * as React from 'react';
import Dialog from './Dialog';
import Button from './Button';

interface Props {
	onSubscribe: () => void
}
export class ReaderSubscriptionPrompt extends React.Component<Props> {
	public render() {
		return (
			<Dialog
				title="Subscription Required"
			>
				<div className="reader-subscription-prompt_7fgp4b">
					<h2>You must subscribe in order to read on Readup.</h2>
					<Button
						text="Subscribe"
						size="large"
						intent="loud"
						onClick={this.props.onSubscribe}
					/>
				</div>
			</Dialog>
		);
	}
}