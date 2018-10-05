import * as React from 'react';
import ButtonBar from './ButtonBar';

interface Props {
	isUserSignedIn: boolean,
	isUserEmailConfirmed: boolean,
	onEnroll: () => void
}
export default class extends React.PureComponent<
	Props,
	{ isSubmitting: boolean }
> {
	constructor(props: Props) {
		super(props);
		this.state = {
			isSubmitting: false
		};
	}
	public render() {
		return (
			<div className="enrollment-prompt-screen">
				{this.props.isUserSignedIn && this.props.isUserEmailConfirmed ?
					<ButtonBar isBusy={this.state.isSubmitting}>
						<button
							type="submit"
							onClick={this.props.onEnroll}
						>&gt;&gt; Start &gt;&gt;</button>
					</ButtonBar> :
					<span className="auth-notice">
						{!this.props.isUserSignedIn ?
							'You must be signed in to play' :
							'You must confirm your email to play'}
					</span>}
			</div>
		);
	}
}