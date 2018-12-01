import * as React from 'react';
import ResendConfirmationEmailActionLink from './controls/ResendConfirmationEmailActionLink';
import UserAccount from '../../../common/models/UserAccount';
import InfoBox from './controls/InfoBox';

export default class extends React.PureComponent<{
	onResendConfirmationEmail: () => Promise<void>,
	user: UserAccount
}, {}> {
	public render() {
		return (
			this.props.user && !this.props.user.isEmailConfirmed ?
				<InfoBox
					icon="warning"
					position="static"
					style="warning"
				>
					Confirm your email address.
					<ResendConfirmationEmailActionLink
						onResend={this.props.onResendConfirmationEmail}
					/> 
				</InfoBox> :
				null
		);
	}
}