import * as React from 'react';
import Dialog from '../../../../../common/components/Dialog';
import AuthServiceButton from '../../../../../common/components/AuthServiceButton';
import AuthServiceProvider from '../../../../../common/models/auth/AuthServiceProvider';
import Link from '../../../../../common/components/Link';
import UserAccount from '../../../../../common/models/UserAccount';
import { TweetWebIntentParams } from '../../../../../common/sharing/twitter';

interface Props {
	onClose: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onOpenTweetComposer: (params: TweetWebIntentParams) => void,
	onUseEmailVerification: () => void,
	user: UserAccount
}

export class TwitterVerificationDialog extends React.Component<Props> {
	private readonly _openTweetComposer = () => {
		this.props.onOpenTweetComposer({
			text: `readup.com has a plan to fix reading on social media and I'm giving it a whirl. My reader name is ${this.props.user.name} @ReadupDotCom`
		});
	};
	public render() {
		return (
			<Dialog
				onClose={this.props.onClose}
				title="Are you on Twitter?"
			>
				<div className="twitter-verification-dialog_fy082z">
					<p>Tweet your Readup username @ReadupDotCom and we'll take it from there.</p>
					<AuthServiceButton
						onClick={this._openTweetComposer}
						provider={AuthServiceProvider.Twitter}
						text="Tweet Verification"
					/>
					<p className="small">Most verifications are processed within 3 business days.</p>
					<Link className="small" onClick={this.props.onUseEmailVerification}>Get verified using email instead.</Link>
				</div>
			</Dialog>
		);
	}
}