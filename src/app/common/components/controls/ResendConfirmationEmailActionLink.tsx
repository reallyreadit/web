import * as React from 'react';
import Context, { contextTypes } from '../../Context';
import ActionLink from '../../../../common/components/ActionLink';
import { Intent } from '../../Page';

export default class extends React.PureComponent<{}, {
	isSending: boolean
}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private _resendConfirmationEmail = () => this.setState(
		{ isSending: true },
		() => this.context.api
			.resendConfirmationEmail()
			.then(() => this.setState(
				{ isSending: false },
				() => this.context.page.showToast('Confirmation email sent', Intent.Success)
			))
			.catch((errors: string[]) => this.setState(
				{ isSending: false },
				() => this.context.page.showToast(
					errors.includes('ResendLimitExceeded') ?
						'Error sending email.\nPlease try again in a few minutes.' :
						'Error sending email.\nPlease try again later.',
					Intent.Danger
				)
			))
	);
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			isSending: false
		};
	}
	public render() {
		return (
			<ActionLink
				text="Resend confirmation email"
				iconLeft="refresh2"
				state={this.state.isSending ? 'busy' : 'normal'}
				onClick={this._resendConfirmationEmail}
			/>
		);
	}
}