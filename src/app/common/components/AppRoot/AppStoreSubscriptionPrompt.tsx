import * as React from 'react';
import AsyncTracker from '../../../../common/AsyncTracker';
import Button from '../../../../common/components/Button';
import Dialog from '../../../../common/components/Dialog';
import { mapPromiseErrorToResultIfNotCancelled, formatProblemDetails } from '../../../../common/format';
import { mapAppResult, mapAppSuccessResult } from '../../../../common/models/app/AppResult';
import { SubscriptionProductsRequest, SubscriptionProductsResponse, SubscriptionProduct } from '../../../../common/models/app/SubscriptionProducts';
import { SubscriptionPurchaseRequest } from '../../../../common/models/app/SubscriptionPurchase';
import { SubscriptionReceiptResponse } from '../../../../common/models/app/SubscriptionReceipt';
import { AppleSubscriptionValidationResponseType, AppleSubscriptionValidationRequest, AppleSubscriptionValidationResponse } from '../../../../common/models/subscriptions/AppleSubscriptionValidation';
import { AsyncResult, Result, ResultType } from '../../../../common/Result';
import SubscriptionSelector from '../controls/SubscriptionSelector';
import DialogSpinner from '../../../../common/components/Dialog/DialogSpinner';
import { FetchFunctionWithParams, FetchFunction } from '../../serverApi/ServerApi';
import { SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse } from '../../../../common/models/subscriptions/SubscriptionPriceLevels';
import { SubscriptionStatusType, ActiveSubscriptionStatus } from '../../../../common/models/subscriptions/SubscriptionStatus';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import { StandardSubscriptionPriceLevel } from '../../../../common/models/subscriptions/SubscriptionPrice';
import { ProblemDetails } from '../../../../common/ProblemDetails';
import { AppStoreErrorType } from '../../../../common/Errors';
import { SubscriptionStatusResponse } from '../../../../common/models/subscriptions/SubscriptionStatusResponse';
import { ReadArticleReference } from '../Root';

interface Props {
	activeSubscription?: ActiveSubscriptionStatus,
	article: ReadArticleReference | null,
	isPaymentProcessing: boolean,
	onClose: () => void,
	onGetSubscriptionPriceLevels: FetchFunctionWithParams<SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse>,
	onGetSubscriptionStatus: FetchFunction<SubscriptionStatusResponse>,
	onReadArticle: (article: ReadArticleReference) => void,
	onRegisterPurchaseCompletedEventHandler: (handler: (result: Result<AppleSubscriptionValidationResponse, ProblemDetails>) => void) => Function,
	onRequestSubscriptionProducts: (request: SubscriptionProductsRequest) => Promise<Result<SubscriptionProductsResponse, ProblemDetails>>,
	onRequestSubscriptionPurchase: (request: SubscriptionPurchaseRequest) => void,
	onRequestSubscriptionReceipt: () => Promise<Result<SubscriptionReceiptResponse, ProblemDetails>>,
	onValidateSubscription: (request: AppleSubscriptionValidationRequest) => Promise<AppleSubscriptionValidationResponse>
}
interface State {
	productsResult: AsyncResult<(SubscriptionProduct & { usdAmount: number })[], string>,
	purchaseResultType: ResultType,
	receiptResult: AsyncResult<SubscriptionReceiptResponse, string>,
	subscriptionStatusResult: AsyncResult<SubscriptionStatusResponse, string>,
	subscriptionValidationResult: AsyncResult<AppleSubscriptionValidationResponse, string>
}
const initialState: State = {
	productsResult: {
		type: ResultType.Loading
	},
	purchaseResultType: ResultType.Loading,
	receiptResult: {
		type: ResultType.Loading
	},
	subscriptionStatusResult: {
		type: ResultType.Loading
	},
	subscriptionValidationResult: {
		type: ResultType.Loading
	}
};
export default class AppStoreSubscriptionPrompt extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _continue = () => {
		// trying to read the article could open another dialog so we need to make sure to
		// close ourself first. should probably manage this better by having onClose accept
		// the dialog's id.
		this.props.onClose();
		if (this.props.article) {
			this.props.onReadArticle(this.props.article);
		}
	};
	private readonly _requestPurchase = (price: StandardSubscriptionPriceLevel) => {
		this.props.onRequestSubscriptionPurchase({
			productId: price.id
		});
	};
	private readonly _restart = () => {
		this.setState(initialState);
		this.requestReceipt();
	};
	constructor(props: Props) {
		super(props);
		this.state = initialState;
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterPurchaseCompletedEventHandler(
				result => {
					if (
						result.type === ResultType.Failure &&
						result.error.type === AppStoreErrorType.PurchaseCancelled
					) {
						return;
					}
					if (
						this.props.activeSubscription &&
						result.type === ResultType.Success
					) {
						this.props.onClose();
					} else {
						this.setState({
							purchaseResultType: (
									result.type === ResultType.Success &&
									result.value.type === AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser
								) ?
									ResultType.Success :
									ResultType.Failure
						});
					}
				}
			)
		);
		this.checkSubscriptionStatus();
	}
	private loadProducts() {
		this._asyncTracker
			.addPromise(
				new Promise<StandardSubscriptionPriceLevel[]>(
					(resolve, reject) => {
						this.props.onGetSubscriptionPriceLevels(
							{
								provider: SubscriptionProvider.Apple
							},
							response => {
								if (response.value) {
									resolve(response.value.prices);
								} else {
									reject(
										new Error(response.errors[0])
									);
								}
							}
						);
					}
				)
			)
			.then(
				priceLevels => this.props
					.onRequestSubscriptionProducts({
						productIds: priceLevels.map(
							priceLevel => priceLevel.id
						)
					})
					.then(
						result => mapAppSuccessResult(
							result,
							value => ({
								products: value.products.map(
									product => ({
										...product,
										usdAmount: priceLevels
											.find(
												priceLevel => priceLevel.id === product.productId
											)
											.amount
									})
								)
							})
						)
					)
			)
			.then(
				result => {
					this.setState({
						productsResult: mapAppResult(
							result,
							value => value.products,
							error => formatProblemDetails(error)
						)
					});
				}
			)
			.catch(
				reason => {
					mapPromiseErrorToResultIfNotCancelled(
						reason,
						result => {
							this.setState({
								productsResult: result
							});
						}
					);
				}
			);
	}
	private renderContent() {
		// process the global state first
		if (this.props.isPaymentProcessing) {
			return this.renderLoadingContent('Processing payment.');
		}
		// then check for purchase completion
		switch (this.state.purchaseResultType) {
			case ResultType.Loading:
				// processing initial checks or waiting for price selection
				break;
			case ResultType.Success:
				return (
					<>
						<div className="message">You're all set.</div>
						{this.props.article ?
							<Button
								iconRight="chevron-right"
								onClick={this._continue}
								text="Continue to Article"
							/> :
							<Button
								onClick={this._continue}
								text="Ok"
							/>}
					</>
				);
			case ResultType.Failure:
				return (
					<>
						<Button
							iconLeft="refresh2"
							onClick={this._restart}
							text="Refresh Subscription Status"
						/>
						<div className="subtitle">You will not be charged.</div>
					</>
				);
		}
		// then process the status check, receipt retrieval, receipt validation, and price selection steps
		switch (this.state.subscriptionStatusResult.type) {
			case ResultType.Loading:
				return this.renderLoadingContent('Checking subscription status.');
			case ResultType.Success:
				// if active, purchase will have been completed, otherwise receipt check should be loading
				break;
			case ResultType.Failure:
				return this.renderErrorContent(this.state.subscriptionStatusResult.error);
		}
		switch (this.state.receiptResult.type) {
			case ResultType.Loading:
				return this.renderLoadingContent('Checking for existing receipt.');
			case ResultType.Success:
				// subscription validation should be loading
				break;
			case ResultType.Failure:
				return this.renderErrorContent(this.state.receiptResult.error);
		}
		switch (this.state.subscriptionValidationResult.type) {
			case ResultType.Loading:
				return this.renderLoadingContent('Checking receipt status.');
			case ResultType.Success:
				switch (this.state.subscriptionValidationResult.value.type) {
					case AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser:
						// products should be loading if changing price, otherwise purchase will have been completed
						break;
					case AppleSubscriptionValidationResponseType.AssociatedWithAnotherUser:
						return (
							<span>Your subscription is associated with the following Readup account: {this.state.subscriptionValidationResult.value.subscribedUsername}</span>
						);
					case AppleSubscriptionValidationResponseType.EmptyReceipt:
						// products should be loading
						break;
				}
				break;
			case ResultType.Failure:
				return this.renderErrorContent(this.state.subscriptionValidationResult.error);
		}
		switch (this.state.productsResult.type) {
			case ResultType.Loading:
				return this.renderLoadingContent('Loading subscription options.');
			case ResultType.Success:
				return (
					<SubscriptionSelector
						activeSubscription={this.props.activeSubscription}
						onSelect={this._requestPurchase}
						options={
							this.state.productsResult.value.map(
								product => ({
									id: product.productId,
									name: product.localizedTitle,
									amount: product.usdAmount,
									formattedAmount: product.localizedPrice
								})
							)
						}
					/>
				);
			case ResultType.Failure:
				return this.renderErrorContent(this.state.productsResult.error);
		}
	}
	private renderErrorContent(message: string) {
		return (
			<span>{message}</span>
		);
	}
	private renderLoadingContent(message: string) {
		return (
			<DialogSpinner message={message} />
		);
	}
	private checkSubscriptionStatus() {
		this.props.onGetSubscriptionStatus(
			this._asyncTracker.addCallback(
				response => {
					if (response.value) {
						if (response.value.status.type === SubscriptionStatusType.Active && !this.props.activeSubscription) {
							this.setState({
								subscriptionStatusResult: {
									type: ResultType.Success,
									value: response.value
								},
								purchaseResultType: ResultType.Success
							});
						} else {
							this.setState({
								subscriptionStatusResult: {
									type: ResultType.Success,
									value: response.value
								}
							});
							this.requestReceipt();
						}
					} else {
						this.setState({
							subscriptionStatusResult: {
								type: ResultType.Failure,
								error: 'Error checking subscription status.'
							}
						});
					}
				}
			)
		);
	}
	private requestReceipt() {
		this._asyncTracker
			.addPromise(
				this.props.onRequestSubscriptionReceipt()
			)
			.then(
				result => {
					/**
					 * The Readup app got rejected by App Store reviewers multiple times starting Sept. 17th, 2021
					 * due to an error message caused by the failure to request the StoreKit receipt. This issue was
					 * not reproducible on any physical iOS devices using Sandbox accounts. As a workaround we're going
					 * to try bypassing the receipt validation if the request fails and skip right to loading the
					 * products. This is not ideal but I believe that Apple servers will prevent duplicate purchases
					 * if this ever hits a real user in production.
					 */
					switch (result.type) {
						case ResultType.Success:
							this.setState({
								receiptResult: result
							});
							this.validateSubscription({
								base64EncodedReceipt: result.value.base64EncodedReceipt
							});
							break;
						case ResultType.Failure:
							this.setState({
								receiptResult: {
									type: ResultType.Success,
									value: {
										base64EncodedReceipt: ''
									}
								},
								subscriptionValidationResult: {
									type: ResultType.Success,
									value: {
										type: AppleSubscriptionValidationResponseType.EmptyReceipt
									}
								}
							});
							this.loadProducts();
							break;
					}
				}
			)
			.catch(
				reason => {
					mapPromiseErrorToResultIfNotCancelled(
						reason,
						result => {
							this.setState({
								receiptResult: result
							})
						}
					);
				}
			);
	}
	private validateSubscription(request: AppleSubscriptionValidationRequest) {
		this._asyncTracker
			.addPromise(
				this.props.onValidateSubscription(request)
			)
			.then(
				response => {
					this.setState({
						subscriptionValidationResult: {
							type: ResultType.Success,
							value: response
						}
					});
					if (
						this.props.activeSubscription ||
						response.type === AppleSubscriptionValidationResponseType.EmptyReceipt ||
						(
							response.type === AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser &&
							response.subscriptionStatus.type !== SubscriptionStatusType.Active
						)
					) {
						this.loadProducts();
					} else if (
						!this.props.activeSubscription &&
						(
							response.type === AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser &&
							response.subscriptionStatus.type === SubscriptionStatusType.Active
						)
					) {
						this.setState({
							purchaseResultType: ResultType.Success
						});
					}
				}
			)
			.catch(
				reason => {
					mapPromiseErrorToResultIfNotCancelled(
						reason,
						result => {
							this.setState({
								subscriptionValidationResult: result
							})
						}
					);
				}
			);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<Dialog
				onClose={this.props.onClose}
				title={
					this.props.article ?
						'Subscription Required' :
						this.props.activeSubscription ?
							'Change Price' :
							'Subscribe'
				}
			>
				<div className="app-store-subscription-prompt_7y5k2n">
					{this.renderContent()}
				</div>
			</Dialog>
		);
	}
}