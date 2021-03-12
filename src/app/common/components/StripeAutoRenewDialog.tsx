import * as React from 'react';
import { ActiveSubscriptionStatus } from '../../../common/models/subscriptions/SubscriptionStatus';
import FormDialog from '../../../common/components/FormDialog';
import { StripeAutoRenewStatusRequest } from '../../../common/models/subscriptions/StripeAutoRenewStatusRequest';

interface Props {
	currentStatus: ActiveSubscriptionStatus,
	onClose: () => void,
	onSetStripeSubscriptionAutoRenewStatus: (request: StripeAutoRenewStatusRequest) => Promise<unknown>
}
export default class StripeAutoRenewDialog extends React.Component<Props> {
	private readonly _submit = () => {
		return this.props.onSetStripeSubscriptionAutoRenewStatus({
			autoRenewEnabled: !this.props.currentStatus.autoRenewEnabled
		});
	};
	public render() {
		let
			content: React.ReactNode,
			title: string;
		if (this.props.currentStatus.autoRenewEnabled) {
			content = (
				<>
					<p>Are you sure you want to cancel your subscription?</p>
					<p>You'll still be able to use Readup for the remainder of the current cycle.</p>
				</>
			);
			title = 'Cancel Subscription';
		} else {
			content = (
				<>
					<p>Are you sure you want to resume your current subscription?</p>
					<p>Your billing date will stay the same and you will not be charged until the next cycle.</p>
				</>
			);
			title = 'Resume Subscription';
		}
		return (
			<FormDialog
				closeButtonText="No"
				onClose={this.props.onClose}
				onSubmit={this._submit}
				size="small"
				submitButtonText="Yes"
				textAlign="center"
				title={title}
			>
				{content}
			</FormDialog>
		);
	}
}