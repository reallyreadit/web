import * as React from 'react';
import Dialog from '../../../common/components/Dialog';
import TransitionContainer from '../../../common/components/TransitionContainer';
import { SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse } from '../../../common/models/subscriptions/SubscriptionPriceLevels';
import { SubscriptionStatusResponse } from '../../../common/models/subscriptions/SubscriptionStatusResponse';
import { FetchFunction, FetchFunctionWithParams } from '../serverApi/ServerApi';
import { Intent } from '../../../common/components/Toaster';
import { StandardSubscriptionPriceLevel, SubscriptionPriceSelection } from '../../../common/models/subscriptions/SubscriptionPrice';
import { Require } from '../../../common/Require';
import AsyncTracker, { CancellationToken } from '../../../common/AsyncTracker';
import { SubscriptionStatus, SubscriptionStatusType, ActiveSubscriptionStatus } from '../../../common/models/subscriptions/SubscriptionStatus';
import StatusCheckStep from './subscriptionsDialogs/StatusCheckStep';
import PriceLevelsCheckStep from './subscriptionsDialogs/PriceLevelsCheckStep';
import SubscriptionProvider from '../../../common/models/subscriptions/SubscriptionProvider';
import PriceSelectionStep from './subscriptionsDialogs/PriceSelectionStep';
import { ConfirmationStep } from './StripePriceChangeDialog/ConfirmationStep';
import { StripePaymentResponse, StripePaymentResponseType } from '../../../common/models/subscriptions/StripePaymentResponse';
import { getPromiseErrorMessage } from '../../../common/format';
import PaymentEntryStep from './subscriptionsDialogs/PaymentEntryStep';
import { DisplayTheme } from '../../../common/models/userAccounts/DisplayPreference';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';

interface Props {
	activeSubscription: ActiveSubscriptionStatus,
	displayTheme: DisplayTheme | null,
	onChangePrice: (price: SubscriptionPriceSelection) => Promise<StripePaymentResponse>,
	onClose: () => void,
	onCompleteUpgrade: (card: StripeCardElement, price: SubscriptionPriceSelection) => Promise<StripePaymentResponse>,
	onCreateStaticContentUrl: (path: string) => string,
	onGetSubscriptionPriceLevels: FetchFunctionWithParams<SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse>,
	onGetSubscriptionStatus: FetchFunction<SubscriptionStatusResponse>,
	onOpenStripeSubscriptionPrompt: () => void,
	onShowToast: (content: string, intent: Intent) => void,
	stripe: Promise<Stripe> | null
}
enum Step {
	SubscriptionStatusCheck,
	PriceLevelsCheck,
	PriceSelection,
	Confirmation,
	PaymentEntry
}
type SubscriptionStatusCheckState = {
	step: Step.SubscriptionStatusCheck,
	nextState?: PriceLevelsCheckState
}
type PriceLevelsCheckState = {
	step: Step.PriceLevelsCheck,
	nextState?: PriceSelectionState
};
type PriceSelectionState = {
	step: Step.PriceSelection,
	priceLevels: StandardSubscriptionPriceLevel[],
	nextState?: ConfirmationState
};
type ConfirmationState = {
	step: Step.Confirmation,
	isDismissable: boolean,
	priceLevels: StandardSubscriptionPriceLevel[],
	selectedPrice: SubscriptionPriceSelection,
	nextState?: PriceSelectionState | PaymentEntryState
}
type PaymentEntryState = {
	step: Step.PaymentEntry,
	isDismissible: boolean,
	priceLevels: StandardSubscriptionPriceLevel[],
	selectedPrice: SubscriptionPriceSelection,
}
type TransitioningState = (
	Require<SubscriptionStatusCheckState, 'nextState'> |
	Require<PriceLevelsCheckState, 'nextState'> |
	Require<PriceSelectionState, 'nextState'> |
	Require<ConfirmationState, 'nextState'>
);
type State = (
	SubscriptionStatusCheckState |
	PriceLevelsCheckState |
	PriceSelectionState |
	ConfirmationState |
	PaymentEntryState
);
function isTransitioning(state: State): state is TransitioningState {
	return state.step !== Step.PaymentEntry && state.nextState != null;
}
export default class StripePriceChangeDialog extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _checkSubscriptionStatus = (status: SubscriptionStatus) => {
		if (this.state.step !== Step.SubscriptionStatusCheck) {
			return;
		}
		if (status.type === SubscriptionStatusType.Active) {
			this.setState({
				step: this.state.step,
				nextState: {
					step: Step.PriceLevelsCheck
				}
			});
		} else {
			this.props.onOpenStripeSubscriptionPrompt();
		}
	};
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
	private readonly _completeUpgrade = (card: StripeCardElement, price: SubscriptionPriceSelection) => {
		return this.handlePaymentRequest(
			this.props.onCompleteUpgrade(card, price)
		);
	};
	private readonly _confirmPriceChange = (price: SubscriptionPriceSelection) => {
		return this.handlePaymentRequest(
			this.props.onChangePrice(price)
		);
	};
	private readonly _goToPriceSelectionStep = () => {
		if (this.state.step !== Step.Confirmation) {
			return;
		}
		this.setState({
			step: this.state.step,
			nextState: {
				step: Step.PriceSelection,
				priceLevels: this.state.priceLevels
			}
		});
	};
	private readonly _goToPaymentEntryStep = () => {
		if (this.state.step !== Step.Confirmation) {
			return;
		}
		this.setState({
			step: this.state.step,
			nextState: {
				step: Step.PaymentEntry,
				isDismissible: true,
				priceLevels: this.state.priceLevels,
				selectedPrice: this.state.selectedPrice
			}
		});
	};
	private readonly _selectPrice = (price: SubscriptionPriceSelection) => {
		if (this.state.step !== Step.PriceSelection) {
			return;
		}
		this.setState({
			step: this.state.step,
			nextState: {
				step: Step.Confirmation,
				isDismissable: true,
				priceLevels: this.state.priceLevels,
				selectedPrice: price
			}
		})
	};
	private readonly _setPriceLevels = (priceLevels: StandardSubscriptionPriceLevel[]) => {
		if (this.state.step !== Step.PriceLevelsCheck) {
			return;
		}
		this.setState({
			step: this.state.step,
			nextState: {
				step: Step.PriceSelection,
				priceLevels
			}
		})
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			step: Step.SubscriptionStatusCheck
		};
	}
	private handlePaymentRequest(request: Promise<StripePaymentResponse>) {
		const step = this.state.step;
		let makeDismissable: () => void;
		switch (step) {
			case Step.Confirmation:
				this.setState({
					step,
					isDismissable: false
				});
				makeDismissable = () => {
					this.setState({
						step,
						isDismissable: true
					});
				};
				break;
			case Step.PaymentEntry:
				this.setState({
					step,
					isDismissable: false
				});
				makeDismissable = () => {
					this.setState({
						step,
						isDismissable: true
					});
				};
				break;
			default:
				return Promise.reject(
					new Error('Invalid step state.')
				);
		}
		return this._asyncTracker
			.addPromise(request)
			.then(
				response => {
					switch (response.type) {
						case StripePaymentResponseType.Succeeded:
							this.props.onShowToast('Price change completed.', Intent.Success);
							this.props.onClose();
							break;
						case StripePaymentResponseType.Failed:
							this.props.onShowToast(`Price change failed: ${response.errorMessage ?? 'Your card was declined.'}`, Intent.Danger);
							makeDismissable();
							break;
					}
					return response;
				}
			)
			.catch(
				reason => {
					if (!(reason as CancellationToken)?.isCancelled) {
						this.props.onShowToast(`Price change failed: ${getPromiseErrorMessage(reason)}`, Intent.Danger);
						makeDismissable();
					}
					throw reason;
				}
			);
	}
	private renderStep() {
		switch (this.state.step) {
			case Step.SubscriptionStatusCheck:
				return (
					<StatusCheckStep
						onGetSubscriptionStatus={this.props.onGetSubscriptionStatus}
						onSubscriptionStatusCheckCompleted={this._checkSubscriptionStatus}
					/>
				);
			case Step.PriceLevelsCheck:
				return (
					<PriceLevelsCheckStep
						onGetSubscriptionPriceLevels={this.props.onGetSubscriptionPriceLevels}
						onSubscriptionPriceLevelsLoaded={this._setPriceLevels}
						provider={SubscriptionProvider.Stripe}
					/>
				);
			case Step.PriceSelection:
				return (
					<PriceSelectionStep
						activeSubscription={this.props.activeSubscription}
						allowCustomPrice
						onSelectPrice={this._selectPrice}
						priceLevels={this.state.priceLevels}
					/>
				);
			case Step.Confirmation:
				return (
					<ConfirmationStep
						activeSubscription={this.props.activeSubscription}
						onChangePrice={this._goToPriceSelectionStep}
						onConfirm={this._confirmPriceChange}
						onUpdatePaymentMethod={this._goToPaymentEntryStep}
						selectedPrice={this.state.selectedPrice}
					/>
				);
			case Step.PaymentEntry:
				return (
					<PaymentEntryStep
						displayTheme={this.props.displayTheme}
						onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
						onSubmit={this._completeUpgrade}
						selectedPrice={this.state.selectedPrice}
						stripe={this.props.stripe}
						submitButtonText="Complete Upgrade"
					/>
				);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<Dialog
				onClose={
					this.state.step !== Step.Confirmation ||
						this.state.isDismissable ?
						this.props.onClose :
						null
				}
				title="Change Price"
			>
				<div className="stripe-price-change-dialog_5lllw">
					<TransitionContainer
						isTransitioning={
							isTransitioning(this.state)
						}
						onTransitionComplete={this._completeTransition}
					>
						{this.renderStep()}
					</TransitionContainer>
				</div>
			</Dialog>
		);
	}
}