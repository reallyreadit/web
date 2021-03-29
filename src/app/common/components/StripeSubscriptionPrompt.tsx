import * as React from 'react';
import Dialog from '../../../common/components/Dialog';
import UserArticle from '../../../common/models/UserArticle';
import TransitionContainer from '../../../common/components/TransitionContainer';
import PaymentEntryStep from './subscriptionsDialogs/PaymentEntryStep';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import HttpEndpoint from '../../../common/HttpEndpoint';
import { DisplayTheme } from '../../../common/models/userAccounts/DisplayPreference';
import AsyncTracker, { CancellationToken } from '../../../common/AsyncTracker';
import { Intent } from '../../../common/components/Toaster';
import { FetchFunction, FetchFunctionWithParams } from '../serverApi/ServerApi';
import ContinueStep from './StripeSubscriptionPrompt/ContinueStep';
import { SubscriptionStatusResponse } from '../../../common/models/subscriptions/SubscriptionStatusResponse';
import { SubscriptionPriceLevelsResponse, SubscriptionPriceLevelsRequest } from '../../../common/models/subscriptions/SubscriptionPriceLevels';
import { SubscriptionStatusType, SubscriptionStatus } from '../../../common/models/subscriptions/SubscriptionStatus';
import { SubscriptionPriceSelection, StandardSubscriptionPriceLevel } from '../../../common/models/subscriptions/SubscriptionPrice';
import { StripePaymentResponse } from '../../../common/models/subscriptions/StripePaymentResponse';
import StatusCheckStep from './subscriptionsDialogs/StatusCheckStep';
import PriceLevelsCheckStep from './subscriptionsDialogs/PriceLevelsCheckStep';
import SubscriptionProvider from '../../../common/models/subscriptions/SubscriptionProvider';
import PriceSelectionStep from './subscriptionsDialogs/PriceSelectionStep';
import { Require } from '../../../common/Require';

interface Props {
	article: UserArticle | null,
	displayTheme: DisplayTheme | null,
	onClose: () => void,
	onGetSubscriptionPriceLevels: FetchFunctionWithParams<SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse>,
	onGetSubscriptionStatus: FetchFunction<SubscriptionStatusResponse>,
	onReadArticle: (article: UserArticle) => void,
	onShowToast: (content: string, intent: Intent) => void,
	onSubscribe: (card: StripeCardElement, price: SubscriptionPriceSelection) => Promise<StripePaymentResponse>,
	staticServerEndpoint: HttpEndpoint,
	stripe: Promise<Stripe> | null,
	subscriptionStatus: SubscriptionStatus
}
enum Step {
	SubscriptionStatusCheck,
	PriceLevelsCheck,
	PriceSelection,
	PaymentEntry,
	Continue
}
type SubscriptionStatusCheckState = {
	step: Step.SubscriptionStatusCheck,
	nextState?: PriceLevelsCheckState | ContinueState
}
type PriceLevelsCheckState = {
	step: Step.PriceLevelsCheck,
	nextState?: PriceSelectionState | ContinueState
};
type PriceSelectionState = {
	step: Step.PriceSelection,
	priceLevels: StandardSubscriptionPriceLevel[],
	nextState?: PaymentEntryState | ContinueState
};
type PaymentEntryState = {
	step: Step.PaymentEntry,
	isDismissable: boolean,
	priceLevels: StandardSubscriptionPriceLevel[],
	selectedPrice: SubscriptionPriceSelection,
	nextState?: PriceSelectionState | ContinueState
}
type ContinueState = {
	step: Step.Continue
};
type TransitioningState = (
	Require<SubscriptionStatusCheckState, 'nextState'> |
	Require<PriceLevelsCheckState, 'nextState'> |
	Require<PriceSelectionState, 'nextState'> |
	Require<PaymentEntryState, 'nextState'>
);
type State = (
	SubscriptionStatusCheckState |
	PriceLevelsCheckState |
	PriceSelectionState |
	PaymentEntryState |
	ContinueState
);
function isTransitioning(state: State): state is TransitioningState {
	return state.step !== Step.Continue && state.nextState != null;
}
export default class StripeSubscriptionPrompt extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _checkSubscriptionStatus = (status: SubscriptionStatus) => {
		if (
			this.state.step === Step.SubscriptionStatusCheck &&
			status.type !== SubscriptionStatusType.Active
		) {
			this.setState({
				step: this.state.step,
				nextState: {
					step: Step.PriceLevelsCheck
				}
			});
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
	private readonly _continue = () => {
		// trying to read the article could open another dialog so we need to make sure to
		// close ourself first. should probably manage this better by having onClose accept
		// the dialog's id.
		this.props.onClose();
		if (this.props.article) {
			this.props.onReadArticle(this.props.article);
		}
	};
	private readonly _goToPriceSelectionStep = () => {
		if (this.state.step !== Step.PaymentEntry) {
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
	private readonly _selectPrice = (price: SubscriptionPriceSelection) => {
		if (this.state.step !== Step.PriceSelection) {
			return;
		}
		this.setState({
			step: this.state.step,
			nextState: {
				step: Step.PaymentEntry,
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
	private readonly _subscribe = (card: StripeCardElement, price: SubscriptionPriceSelection) => {
		if (this.state.step !== Step.PaymentEntry) {
			return Promise.reject(
				new Error('Invalid step state.')
			);
		}
		this.setState({
			step: this.state.step,
			isDismissable: false
		});
		return this._asyncTracker
			.addPromise(
				this.props.onSubscribe(card, price)
			)
			.then(
				response => {
					this.setState({
						step: Step.PaymentEntry,
						isDismissable: true
					});
					return response;
				}
			)
			.catch(
				reason => {
					if (!(reason as CancellationToken)?.isCancelled) {
						this.setState({
							step: Step.PaymentEntry,
							isDismissable: true
						});
					}
					throw reason;
				}
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			step: Step.SubscriptionStatusCheck
		};
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
						allowCustomPrice
						onSelectPrice={this._selectPrice}
						priceLevels={this.state.priceLevels}
					/>
				);
			case Step.PaymentEntry:
				return (
					<PaymentEntryStep
						displayTheme={this.props.displayTheme}
						onChangePrice={this._goToPriceSelectionStep}
						onShowToast={this.props.onShowToast}
						onSubscribe={this._subscribe}
						selectedPrice={this.state.selectedPrice}
						staticServerEndpoint={this.props.staticServerEndpoint}
						stripe={this.props.stripe}
					/>
				);
			case Step.Continue:
				return (
					<ContinueStep
						isReadingArticle={!!this.props.article}
						onContinue={this._continue}
					/>
				);
		}
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			this.props.subscriptionStatus.type === SubscriptionStatusType.Active &&
			prevProps.subscriptionStatus.type !== SubscriptionStatusType.Active &&
			this.state.step !== Step.Continue
		) {
			this.setState(
				{
					step: this.state.step,
					nextState: {
						step: Step.Continue
					}
				} as (
					Pick<SubscriptionStatusCheckState, 'step' | 'nextState'> |
					Pick<PriceLevelsCheckState, 'step' | 'nextState'> |
					Pick<PriceSelectionState, 'step' | 'nextState'> |
					Pick<PaymentEntryState, 'step' | 'nextState'>
				)
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
					this.state.step !== Step.PaymentEntry ||
					this.state.isDismissable ?
						this.props.onClose :
						null
				}
				title={
					this.props.article ?
						'Subscription Required' :
						'Subscribe'
				}
			>
				<div className="stripe-subscription-prompt_3cqidx">
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