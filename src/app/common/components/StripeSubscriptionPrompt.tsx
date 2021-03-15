import * as React from 'react';
import Dialog from '../../../common/components/Dialog';
import UserArticle from '../../../common/models/UserArticle';
import SubscriptionSelector from './controls/SubscriptionSelector';
import TransitionContainer from '../../../common/components/TransitionContainer';
import PaymentEntryStep from './StripeSubscriptionPrompt/PaymentEntryStep';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import HttpEndpoint from '../../../common/HttpEndpoint';
import { DisplayTheme } from '../../../common/models/userAccounts/DisplayPreference';
import AsyncTracker, { CancellationToken } from '../../../common/AsyncTracker';
import { Intent } from '../../../common/components/Toaster';
import { FetchFunction, FetchFunctionWithParams } from '../serverApi/ServerApi';
import ContinueStep from './StripeSubscriptionPrompt/ContinueStep';
import { SubscriptionStatusResponse } from '../../../common/models/subscriptions/SubscriptionStatusResponse';
import { SubscriptionPriceLevelsResponse, SubscriptionPriceLevelsRequest } from '../../../common/models/subscriptions/SubscriptionPriceLevels';
import Fetchable from '../../../common/Fetchable';
import DialogSpinner from '../../../common/components/Dialog/DialogSpinner';
import { SubscriptionStatusType, SubscriptionStatus } from '../../../common/models/subscriptions/SubscriptionStatus';
import { SubscriptionPrice, formatSubscriptionPriceAmount } from '../../../common/models/subscriptions/SubscriptionPrice';
import SubscriptionProvider from '../../../common/models/subscriptions/SubscriptionProvider';
import { StripePaymentResponse } from '../../../common/models/subscriptions/StripePaymentResponse';

interface Props {
	article: UserArticle | null,
	displayTheme: DisplayTheme | null,
	onClose: () => void,
	onGetSubscriptionPriceLevels: FetchFunctionWithParams<SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse>,
	onGetSubscriptionStatus: FetchFunction<SubscriptionStatusResponse>,
	onReadArticle: (article: UserArticle) => void,
	onShowToast: (content: string, intent: Intent) => void,
	onSubscribe: (card: StripeCardElement, price: SubscriptionPrice) => Promise<StripePaymentResponse>,
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
interface State {
	currentStep: Step,
	isDismissable: boolean,
	priceLevels: Fetchable<SubscriptionPriceLevelsResponse>,
	selectedPrice: SubscriptionPrice | null,
	subscriptionStatus: Fetchable<SubscriptionStatusResponse>,
	transitioningToStep: Step | null
}
export default class StripeSubscriptionPrompt extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _completeTransition = () => {
		this.setState({
			currentStep: this.state.transitioningToStep,
			transitioningToStep: null
		});
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
		this.setState({
			transitioningToStep: Step.PriceSelection
		});
	};
	private readonly _selectPrice = (price: SubscriptionPrice) => {
		this.setState({
			selectedPrice: price,
			transitioningToStep: Step.PaymentEntry
		})
	};
	private readonly _subscribe = (card: StripeCardElement, price: SubscriptionPrice) => {
		this.setState({
			isDismissable: false
		});
		return this._asyncTracker
			.addPromise(
				this.props.onSubscribe(card, price)
			)
			.then(
				response => {
					this.setState({
						isDismissable: true
					});
					return response;
				}
			)
			.catch(
				reason => {
					if (!(reason as CancellationToken)?.isCancelled) {
						this.setState({
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
			currentStep: Step.SubscriptionStatusCheck,
			isDismissable: true,
			priceLevels: {
				isLoading: true
			},
			selectedPrice: null,
			subscriptionStatus: props.onGetSubscriptionStatus(
				this._asyncTracker.addCallback(
					subscriptionStatus => {
						if (
							subscriptionStatus.value &&
							subscriptionStatus.value.status.type !== SubscriptionStatusType.Active
						) {
							props.onGetSubscriptionPriceLevels(
								{
									provider: SubscriptionProvider.Stripe
								},
								this._asyncTracker.addCallback(
									priceLevels => {
										this.setState({
											priceLevels,
											transitioningToStep: Step.PriceSelection
										});
									}
								)
							);
							this.setState({
								transitioningToStep: Step.PriceLevelsCheck
							});
						} else if (subscriptionStatus.errors) {
							this.setState({ subscriptionStatus });
						}
					}
				)
			),
			transitioningToStep: null
		};
	}
	private renderContent() {
		switch (this.state.currentStep) {
			case Step.SubscriptionStatusCheck:
				if (this.state.subscriptionStatus.errors) {
					return <span>Error checking subscription status: {this.state.subscriptionStatus.errors[0]}</span>;
				}
				return (
					<DialogSpinner message="Checking subscription status." />
				);
				// If the status check completed successfully we'll either be transitioning to
				// the price selection or continuation step.
			case Step.PriceLevelsCheck:
				if (this.state.priceLevels.errors) {
					return <span>Error loading subscription options: {this.state.priceLevels.errors[0]}</span>;
				}
				return (
					<DialogSpinner message="Loading subscription options." />
				);
				// If the price levels check completed successfully we'll be transitioning to the
				// price selection step.
			case Step.PriceSelection:
				return (
					<SubscriptionSelector
						allowCustomPrice
						onSelect={this._selectPrice}
						options={
							this.state.priceLevels.value.prices.map(
								priceLevel => ({
									...priceLevel,
									formattedAmount: formatSubscriptionPriceAmount(priceLevel.amount)
								})
							)
						}
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
			prevProps.subscriptionStatus.type !== SubscriptionStatusType.Active
		) {
			this.setState({
				transitioningToStep: Step.Continue
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<Dialog
				onClose={
					this.state.isDismissable ?
						this.props.onClose :
						null
				}
				title="Subscription Required"
			>
				<div className="stripe-subscription-prompt_3cqidx">
					<TransitionContainer
						isTransitioning={this.state.transitioningToStep != null}
						onTransitionComplete={this._completeTransition}
					>
						{this.renderContent()}
					</TransitionContainer>
				</div>
			</Dialog>
		);
	}
}