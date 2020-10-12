import * as React from 'react';
import TwitterAuthButton from '../../../../../common/components/TwitterAuthButton';
import Button from '../../../../../common/components/Button';

interface Props {
	analyticsAction: string,
	onSignIn: () => void,
	onSignInWithTwitter: (analyticsAction: string) => Promise<{}>,
	onSkip: () => void
}
export default class TwitterStep extends React.PureComponent<Props> {
	private readonly _signInWithTwitter = () => {
		return this.props.onSignInWithTwitter(this.props.analyticsAction);
	};
	public render() {
		return (
			<div className="twitter-step_elydna">
				<h1>Get Started</h1>
				<h2>Want to quick start with Twitter?</h2>
				<h2>We'll never post without your permission.</h2>
				<TwitterAuthButton
					imageBasePath="/images/"
					text="Connect with Twitter"
					onClick={this._signInWithTwitter}
				/>
				<Button
					display="inline"
					onClick={this.props.onSkip}
					text="Skip"
				/>
			</div>
		);
	}
}