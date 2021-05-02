import * as React from 'react';
import Dialog from './Dialog';
import Button from './Button';

interface Props {
	onCreateStaticContentUrl: (path: string) => string,
	onSubscribe: () => void
}
export class ReaderSubscriptionPrompt extends React.Component<Props> {
	public render() {
		return (
			<Dialog>
				<div className="reader-subscription-prompt_7fgp4b">
					<div className="text">Subscribe to start reading. Watch your money go to the writers you read.</div>
					<img src={this.props.onCreateStaticContentUrl('/app/images/home/watch-money.png')} alt="My Impact illustration." />
					<div className="text">Pay what you want.</div>
					<Button
						intent="primary"
						onClick={this.props.onSubscribe}
						size="large"
						text="Pick your price"
					/>
				</div>
			</Dialog>
		);
	}
}