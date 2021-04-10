import * as React from 'react';
import Dialog from '../../../../common/components/Dialog';
import { StripeCreditCardForm } from '../subscriptionsDialogs/StripeCreditCardForm';
import { DisplayTheme } from '../../../../common/models/userAccounts/DisplayPreference';
import { StripeCardElement, Stripe } from '@stripe/stripe-js';
import { Intent } from '../../../../common/components/Toaster';
import { getPromiseErrorMessage } from '../../../../common/format';
import { SubscriptionPaymentMethodResponse } from '../../../../common/models/subscriptions/SubscriptionPaymentMethod';
import AsyncTracker, { CancellationToken } from '../../../../common/AsyncTracker';

interface Props {
	displayTheme: DisplayTheme | null,
	onCloseDialog: () => void,
	onChangePaymentMethod: (card: StripeCardElement) => Promise<SubscriptionPaymentMethodResponse>,
	onCreateStaticContentUrl: (path: string) => string,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	stripe: Promise<Stripe> | null
}
interface State {
	isSubmitting: boolean
}
export class ChangePaymentMethodDialog extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _submit = (card: StripeCardElement) => {
		this.setState({
			isSubmitting: true
		});
		return this._asyncTracker.addPromise(
			this.props
				.onChangePaymentMethod(card)
				.then(
					() => {
						this.props.onShowToast('Card changed.', Intent.Success);
						this.props.onCloseDialog();
					}
				)
				.catch(
					reason => {
						this.props.onShowToast(
							getPromiseErrorMessage(reason),
							Intent.Danger
						);
						if (!(reason as CancellationToken)?.isCancelled) {
							this.setState({
								isSubmitting: false
							});
						}
						throw reason;
					}
				)
		);
	}
	constructor(props: Props) {
		super(props);
		this.state = {
			isSubmitting: false
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<Dialog
				onClose={
					!this.state.isSubmitting ?
						this.props.onCloseDialog :
						null
				}
				title="Use Another Card"
			>
				<div className="change-payment-method-dialog_6vufow">
					<StripeCreditCardForm
						displayTheme={this.props.displayTheme}
						label="Card Details"
						onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
						onSubmit={this._submit}
						stripe={this.props.stripe}
						submitButtonText="Submit"
					/>
				</div>
			</Dialog>
		);
	}
}