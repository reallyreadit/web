import * as React from 'react';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { DisplayTheme } from '../../../../common/models/userAccounts/DisplayPreference';
import { SubscriptionPriceSelection } from '../../../../common/models/subscriptions/SubscriptionPrice';
import { StripePaymentResponse } from '../../../../common/models/subscriptions/StripePaymentResponse';
import { PriceSelectionSummary } from '../subscriptionsDialogs/PriceSelectionSummary';
import { StripeCreditCardForm } from './StripeCreditCardForm';
import AsyncTracker, { CancellationToken } from '../../../../common/AsyncTracker';

interface Props {
	displayTheme: DisplayTheme | null,
	onChangePrice?: () => void,
	onCreateStaticContentUrl: (path: string) => string,
	onSubmit: (card: StripeCardElement, price: SubscriptionPriceSelection) => Promise<StripePaymentResponse>,
	selectedPrice: SubscriptionPriceSelection,
	stripe: Promise<Stripe> | null,
	submitButtonText: string
}
interface State {
	isSubmitting: boolean
}
export default class PaymentEntryStep extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _submit = (card: StripeCardElement) => {
		this.setState({
			isSubmitting: true
		});
		return this._asyncTracker.addPromise(
			this.props
				.onSubmit(card, this.props.selectedPrice)
				.then(
					() => {
						this.setState({
							isSubmitting: false
						});
					}
				)
				.catch(
					reason => {
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
			<div className="payment-entry-step_w0p5nn">
				<StripeCreditCardForm
					displayTheme={this.props.displayTheme}
					label="Payment Method"
					onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
					onSubmit={this._submit}
					stripe={this.props.stripe}
					submitButtonText={this.props.submitButtonText}
				>
					<PriceSelectionSummary
						disabled={this.state.isSubmitting}
						onChangePrice={this.props.onChangePrice}
						selectedPrice={this.props.selectedPrice}
					/>
				</StripeCreditCardForm>
			</div>
		);
	}
}