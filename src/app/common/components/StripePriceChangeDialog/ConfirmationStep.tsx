import * as React from 'react';
import { PriceSelectionSummary } from '../subscriptionsDialogs/PriceSelectionSummary';
import { SubscriptionPriceSelection } from '../../../../common/models/subscriptions/SubscriptionPrice';
import Button from '../../../../common/components/Button';
import { StripePaymentResponse, StripePaymentResponseType } from '../../../../common/models/subscriptions/StripePaymentResponse';
import AsyncTracker, { CancellationToken } from '../../../../common/AsyncTracker';
import { ActiveSubscriptionStatus } from '../../../../common/models/subscriptions/SubscriptionStatus';

interface Props {
	activeSubscription: ActiveSubscriptionStatus,
	onChangePrice: () => void,
	onConfirm: (price: SubscriptionPriceSelection) => Promise<StripePaymentResponse>,
	selectedPrice: SubscriptionPriceSelection,
}
interface State {
	isSubmitting: boolean
}
export class ConfirmationStep extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _submit = () => {
		this.setState(
			prevState => {
				if (prevState.isSubmitting) {
					return null;
				}
				this._asyncTracker
					.addPromise(
						this.props.onConfirm(this.props.selectedPrice)
					)
					.then(
						response => {
							if (response.type === StripePaymentResponseType.Failed) {
								this.setState({
									isSubmitting: false
								});
							}
						}
					)
					.catch(
						reason => {
							if ((reason as CancellationToken)?.isCancelled) {
								return;
							}
							this.setState({
								isSubmitting: false
							});
						}
					)
				return {
					isSubmitting: true
				};
			}
		);
	};
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
			<div className="confirmation-step_yoguba">
				<PriceSelectionSummary
					disabled={this.state.isSubmitting}
					onChangePrice={this.props.onChangePrice}
					selectedPrice={this.props.selectedPrice}
				/>
				<div className="form">
					<div className="notice">
						{this.props.selectedPrice.amount === this.props.activeSubscription.price.amount ?
							<p>Your current price will resume immediately.</p> :
							this.props.selectedPrice.amount < this.props.activeSubscription.price.amount ?
								<p>Your new price will go in to effect with the start of your next billing cycle.</p> :
								<>
									<p>Your new price will go in to effect immediately and start a new billing cycle.</p>
									<p>The remaining portion of your current billing cycle will be applied as a discount to your first payment.</p>
								</>}
					</div>
					<Button
						intent="loud"
						onClick={this._submit}
						size="large"
						state={
							this.state.isSubmitting ?
								'busy' :
								'normal'
						}
						style="preferred"
						text="Confirm"
					/>
				</div>
			</div>
		);
	}
}