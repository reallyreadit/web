import * as React from 'react';
import ButtonBar from './ButtonBar';
import Context, { contextTypes } from '../../Context';
import ChallengeResponseAction from '../../../../common/models/ChallengeResponseAction';

interface Props {
	isUserSignedIn: boolean,
	isUserEmailConfirmed: boolean,
	onEnroll: () => void
}
export default class extends React.PureComponent<
	Props,
	{ isSubmitting: boolean }
> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _decline = () => {
		this.setState({ isSubmitting: true });
		this.context.api
			.createChallengeResponse(
				this.context.challenge.activeChallenge.id,
				ChallengeResponseAction.Decline
			)
			.then(data => {
				this.context.challenge.update({
					latestResponse: data.response,
					score: data.score
				});
			});
	};
	constructor(props: Props, context: Context) {
		super(props, context);
		this.state = {
			isSubmitting: false
		};
	}
	public render() {
		const buttonsEnabled = this.props.isUserSignedIn && this.props.isUserEmailConfirmed;
		return (
			<div className="enrollment-prompt-screen">
				<span className="text">Join the Pizza Challenge!</span>
				<span className="text">First 100 users to read an article a day for 10 days in a row win a <span className="pizza">FREE PIZZA!</span></span>
				<ButtonBar isBusy={this.state.isSubmitting}>
					<button
						type="submit"
						onClick={this.props.onEnroll}
						disabled={!buttonsEnabled}
					>Let's Go!</button>
					<button
						type="cancel"
						onClick={this._decline}
						disabled={!buttonsEnabled}
					>No Thanks</button>
				</ButtonBar>
				{!this.props.isUserSignedIn || !this.props.isUserEmailConfirmed ?
					<span className="auth-notice">
						<span className="text">
							{!this.props.isUserSignedIn ?
								'You must be signed in to play' :
								'You must confirm your email to play'}
						</span>
					</span> :
					null}
			</div>
		);
	}
}