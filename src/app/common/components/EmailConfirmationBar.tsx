import * as React from 'react';
import Separator from '../../../common/components/Separator';
import Icon from '../../../common/components/Icon';
import ResendConfirmationEmailActionLink from './controls/ResendConfirmationEmailActionLink';
import UserAccount from '../../../common/models/UserAccount';

export default class extends React.PureComponent<{
	onResendConfirmationEmail: () => Promise<void>,
	user: UserAccount
}, {}> {
	public render() {
		return (
		   this.props.user && !this.props.user.isEmailConfirmed ?
				<div className="email-confirmation-bar">
					<Icon name="exclamation" /> Please confirm your email address ({this.context.user.userAccount.email})<br />
					Need a new confirmation email?
					<Separator />
					<ResendConfirmationEmailActionLink
						onResend={this.props.onResendConfirmationEmail}
					/> 
				</div> :
				null
		);
	}
}