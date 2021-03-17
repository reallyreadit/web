import * as React from 'react';
import { ActiveSubscriptionStatus, SubscriptionStatusType } from '../../../common/models/subscriptions/SubscriptionStatus';
import FormDialog from '../../../common/components/FormDialog';
import { StripeAutoRenewStatusRequest } from '../../../common/models/subscriptions/StripeAutoRenewStatusRequest';
import { Intent } from '../../../common/components/Toaster';
import { SubscriptionStatusResponse } from '../../../common/models/subscriptions/SubscriptionStatusResponse';
import { getPromiseErrorMessage } from '../../../common/format';

interface Props {
	currentStatus: ActiveSubscriptionStatus,
	onClose: () => void,
	onShowToast: (content: string, intent: Intent) => void,
	onSetStripeSubscriptionAutoRenewStatus: (request: StripeAutoRenewStatusRequest) => Promise<SubscriptionStatusResponse>
}
export default class StripeAutoRenewDialog extends React.Component<Props> {
	private readonly _submit = () => this.props
		.onSetStripeSubscriptionAutoRenewStatus({
			autoRenewEnabled: !this.props.currentStatus.autoRenewEnabled
		})
		.then(
			response => {
				if (response.status.type === SubscriptionStatusType.Active) {
					this.props.onShowToast(
						response.status.autoRenewEnabled ?
							'Subscription resumed.' :
							'Subscription cancelled.',
						Intent.Success
					);
				}
			}
		)
		.catch(
			reason => {
				this.props.onShowToast(`Error: ${getPromiseErrorMessage(reason)}`, Intent.Danger);
				throw reason;
			}
		);
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