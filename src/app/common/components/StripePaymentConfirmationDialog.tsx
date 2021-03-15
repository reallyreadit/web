import * as React from 'react';
import Dialog from '../../../common/components/Dialog';
import AsyncTracker, { CancellationToken } from '../../../common/AsyncTracker';
import TransitionContainer from '../../../common/components/TransitionContainer';
import DialogSpinner from '../../../common/components/Dialog/DialogSpinner';
import Button from '../../../common/components/Button';
import { FetchFunction } from '../serverApi/ServerApi';
import { SubscriptionStatusResponse } from '../../../common/models/subscriptions/SubscriptionStatusResponse';
import { Intent } from '../../../common/components/Toaster';
import { StripePaymentResponse, StripePaymentResponseType } from '../../../common/models/subscriptions/StripePaymentResponse';
import { SubscriptionStatusType } from '../../../common/models/subscriptions/SubscriptionStatus';
import { getPromiseErrorMessage } from '../../../common/format';
import { Require } from '../../../common/Require';

interface Props {
	invoiceId: string,
	onClose: () => void,
	onGetSubscriptionStatus: FetchFunction<SubscriptionStatusResponse>,
	onShowToast: (content: string, intent: Intent) => void,
	onConfirmPayment: (invoiceId: string) => Promise<StripePaymentResponse>
}
enum Step {
	SubscriptionStatusCheck,
	PaymentConfirmation,
	Success,
	Failure
}
type SubscriptionStatusCheckState = {
	step: Step.SubscriptionStatusCheck,
	nextState?: PaymentConfirmationState | SuccessState | FailureState
};
type PaymentConfirmationState = {
	step: Step.PaymentConfirmation,
	nextState?: SuccessState | FailureState
};
type SuccessState = {
	step: Step.Success
};
type FailureState = {
	step: Step.Failure,
	message: string
};
type TransitioningState = Require<SubscriptionStatusCheckState, 'nextState'> | Require<PaymentConfirmationState, 'nextState'>;
type State = SubscriptionStatusCheckState | PaymentConfirmationState | SuccessState | FailureState;
function isTransitioning(state: State): state is TransitioningState {
	return (
		(
			state.step === Step.SubscriptionStatusCheck ||
			state.step === Step.PaymentConfirmation
		) &&
		state.nextState != null
	);
}
export default class StripeSubscriptionConfirmationDialog extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _completeTransition = () => {
		if (
			isTransitioning(this.state)
		) {
			this.setState({
				...this.state.nextState,
				nextState: null
			});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			step: Step.SubscriptionStatusCheck
		};
		props.onGetSubscriptionStatus(
			this._asyncTracker.addCallback(
				response => {
					if (!response.value) {
						this.setState({
							step: Step.SubscriptionStatusCheck,
							nextState: {
								step: Step.Failure,
								message: 'Error checking subscription status.'
							}
						});
					} else if (response.value.status.type === SubscriptionStatusType.PaymentConfirmationRequired) {
						this.setState({
							step: Step.SubscriptionStatusCheck,
							nextState: {
								step: Step.PaymentConfirmation
							}
						});
						this._asyncTracker.addPromise(
							props
								.onConfirmPayment(response.value.status.invoiceId)
								.then(
									response => {
										switch (response.type) {
											case StripePaymentResponseType.Succeeded:
												this.props.onShowToast('Payment confirmed.', Intent.Success);
												this.setState({
													step: Step.PaymentConfirmation,
													nextState: {
														step: Step.Success
													}
												});
												break;
											case StripePaymentResponseType.Failed:
												throw new Error(response.errorMessage ?? 'An unexpected error occurred.');
										}
									}
								)
								.catch(
									reason => {
										if ((reason as CancellationToken)?.isCancelled) {
											return;
										}
										this.props.onShowToast(`Payment confirmation failed: ${getPromiseErrorMessage(reason)}`, Intent.Danger);
										this.setState({
											step: Step.PaymentConfirmation,
											nextState: {
												step: Step.Failure,
												message: 'Error confirming payment.'
											}
										});
									}
								)
						);
					} else if (response.value.status.type === SubscriptionStatusType.Active) {
						this.setState({
							step: Step.SubscriptionStatusCheck,
							nextState: {
								step: Step.Success
							}
						});
					} else {
						this.setState({
							step: Step.SubscriptionStatusCheck,
							nextState: {
								step: Step.Failure,
								message: 'Payment cannot be confirmed.'
							}
						});
					}
				}
			)
		);
	}
	private renderContent() {
		switch (this.state.step) {
			case Step.SubscriptionStatusCheck:
				return (
					<DialogSpinner message="Verifying payment status." />
				);
			case Step.PaymentConfirmation:
				return (
					<DialogSpinner message="Initiating payment confirmation." />
				);
			case Step.Success:
				return (
					<>
						<div className="message">You're all set.</div>
						<Button
							onClick={this.props.onClose}
							text="Ok"
						/>
					</>
				);
			case Step.Failure:
				return (
					<>
						<div className="message">{this.state.message}</div>
						<Button
							onClick={this.props.onClose}
							text="Ok"
						/>
					</>
				);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<Dialog
				onClose={this.props.onClose}
				title="Confirm Payment"
			>
				<div className="stripe-payment-confirmation-dialog_pmtnq8">
					<TransitionContainer
						isTransitioning={isTransitioning(this.state)}
						onTransitionComplete={this._completeTransition}
					>
						{this.renderContent()}
					</TransitionContainer>
				</div>
			</Dialog>
		);
	}
}