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
	onUpdatePaymentMethod: () => void,
	selectedPrice: SubscriptionPriceSelection,
}
enum Step {
	Initial,
	Submitting,
	Failed
}
interface State {
	step: Step
}
export class ConfirmationStep extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _submit = () => {
		this.setState(
			prevState => {
				if (prevState.step !== Step.Initial) {
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
									step: Step.Failed
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
								step: Step.Failed
							});
						}
					)
				return {
					step: Step.Submitting
				};
			}
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			step: Step.Initial
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const changeType = (
			this.props.selectedPrice.amount === this.props.activeSubscription.price.amount ?
				'resume' :
				this.props.selectedPrice.amount < this.props.activeSubscription.price.amount ?
					'downgrade' :
					'upgrade'
		);
		return (
			<div className="confirmation-step_yoguba">
				<PriceSelectionSummary
					disabled={this.state.step !== Step.Initial}
					onChangePrice={
						this.state.step === Step.Initial || this.state.step === Step.Submitting ?
							this.props.onChangePrice :
							null
					}
					selectedPrice={this.props.selectedPrice}
				/>
				<div className="form">
					{this.state.step === Step.Initial || this.state.step === Step.Submitting ?
						<>
							<div className="notice">
								{changeType === 'resume' ?
									<p>Your current price will resume immediately.</p> :
									changeType === 'downgrade' ?
										<p>Your new price will go in to effect with the start of your next billing cycle.</p> :
										<>
											<p>Your new price will go in to effect immediately and start a new billing cycle.</p>
											<p>The remainder of your current cycle will be discounted.</p>
										</>}
							</div>
							<Button
								intent="loud"
								onClick={this._submit}
								size="large"
								state={
									this.state.step === Step.Submitting ?
										'busy' :
										'normal'
								}
								style="preferred"
								text="Confirm"
							/>
						</> :
						changeType === 'upgrade' ?
							<>
								<div className="notice">
									<p>We were unable to complete the upgrade using your card on file.</p>
									<p>Please update your payment method and try again.</p>
								</div>
								<Button
									intent="loud"
									onClick={this.props.onUpdatePaymentMethod}
									size="large"
									style="preferred"
									text="Update Payment Method"
								/>
							</> :
							<div className="notice">
								<p>An unexpected error occurred.</p>
							</div>}
				</div>
			</div>
		);
	}
}