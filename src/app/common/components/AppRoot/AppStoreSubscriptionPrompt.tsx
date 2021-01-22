import * as React from 'react';
import AsyncTracker from '../../../../common/AsyncTracker';
import Button from '../../../../common/components/Button';
import Dialog from '../../../../common/components/Dialog';
import { mapPromiseErrorToResultIfNotCancelled } from '../../../../common/format';
import { mapAppResult, ErrorResponse, mapAppSuccessResult } from '../../../../common/models/app/AppResult';
import { ProductsRequestError, ReceiptRequestError, TransactionError } from '../../../../common/models/app/Errors';
import { SubscriptionProductsRequest, SubscriptionProductsResponse, SubscriptionProduct } from '../../../../common/models/app/SubscriptionProducts';
import { SubscriptionPurchaseRequest } from '../../../../common/models/app/SubscriptionPurchase';
import { SubscriptionReceiptResponse } from '../../../../common/models/app/SubscriptionReceipt';
import { AppleSubscriptionValidationResponseType, AppleSubscriptionValidationRequest, AppleSubscriptionValidationResponse } from '../../../../common/models/subscriptions/AppleSubscriptionValidation';
import UserAccount from '../../../../common/models/UserAccount';
import UserArticle from '../../../../common/models/UserArticle';
import { AsyncResult, Result, ResultType } from '../../../../common/Result';
import SubscriptionSelector from '../controls/SubscriptionSelector';
import DialogSpinner from '../../../../common/components/Dialog/DialogSpinner';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import { SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse } from '../../../../common/models/subscriptions/SubscriptionPriceLevels';
import { SubscriptionStatus, SubscriptionStatusType } from '../../../../common/models/subscriptions/SubscriptionStatus';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import { SubscriptionPriceLevel, SubscriptionPrice } from '../../../../common/models/subscriptions/SubscriptionPrice';

interface Props {
	article: UserArticle,
	isPaymentProcessing: boolean,
	onClose: () => void,
	onGetSubscriptionPriceLevels: FetchFunctionWithParams<SubscriptionPriceLevelsRequest, SubscriptionPriceLevelsResponse>,
	onReadArticle: (article: UserArticle) => void,
	onRegisterPurchaseCompletedEventHandler: (handler: (result: Result<AppleSubscriptionValidationResponse, ErrorResponse<TransactionError>>) => void) => Function,
	onRequestSubscriptionProducts: (request: SubscriptionProductsRequest) => Promise<Result<SubscriptionProductsResponse, ErrorResponse<ProductsRequestError>>>,
	onRequestSubscriptionPurchase: (request: SubscriptionPurchaseRequest) => void,
	onRequestSubscriptionReceipt: () => Promise<Result<SubscriptionReceiptResponse, ErrorResponse<ReceiptRequestError>>>,
	onValidateSubscription: (request: AppleSubscriptionValidationRequest) => Promise<AppleSubscriptionValidationResponse>,
	subscriptionStatus: SubscriptionStatus,
	user: UserAccount | null
}
interface State {
	productsResult: AsyncResult<(SubscriptionProduct & { usdAmount: number })[], string>,
	purchaseFailed: boolean,
	receiptResult: AsyncResult<SubscriptionReceiptResponse, string>,
	subscriptionStatusResult: AsyncResult<AppleSubscriptionValidationResponse, string>
}
const initialState: State = {
	productsResult: {
		type: ResultType.Loading
	},
	purchaseFailed: false,
	receiptResult: {
		type: ResultType.Loading
	},
	subscriptionStatusResult: {
		type: ResultType.Loading
	}
};
export default class AppStoreSubscriptionPrompt extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _readArticle = () => {
		this.props.onReadArticle(this.props.article);
		this.props.onClose();
	};
	private readonly _requestPurchase = (price: SubscriptionPrice) => {
		this.props.onRequestSubscriptionPurchase({
			productId: (price as SubscriptionPriceLevel).id
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
					// if the purchase succeeds the user will be subscribed and will be prompted
					// to continue to the article. if the purchase fails for any reason other than
					// a cancellation we need to set an error state to prevent the subscription
					// selector from being displayed again.
					if (
						(
							result.type === ResultType.Success &&
							result.value.type === AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser
						) ||
						(
							result.type === ResultType.Failure &&
							result.error.value === TransactionError.Cancelled
						)
					) {
						return;
					}
					this.setState({
						purchaseFailed: true
					});
				}
			)
		);
		this.requestReceipt();
	}
	private loadProducts() {
		this._asyncTracker
			.addPromise(
				new Promise<SubscriptionPriceLevel[]>(
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
							{
								[ProductsRequestError.CannotMakePayments]: 'The account that is signed in to the App Store cannot make payments.'
							}
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
		if (this.props.subscriptionStatus.type === SubscriptionStatusType.Active) {
			return (
				<>
					<div className="message">You're all set.</div>
					<Button
						iconRight="chevron-right"
						onClick={this._readArticle}
						text="Continue to Article"
					/>
				</>
			);
		}
		// then fall back to the local state
		if (this.state.purchaseFailed) {
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
		switch (this.state.receiptResult.type) {
			case ResultType.Loading:
				return this.renderLoadingContent('Checking for existing receipt.');
			case ResultType.Success:
				// subscription status should be loading
				break;
			case ResultType.Failure:
				return this.renderErrorContent(this.state.receiptResult.error);
		}
		switch (this.state.subscriptionStatusResult.type) {
			case ResultType.Loading:
				return this.renderLoadingContent('Checking subscription status.');
			case ResultType.Success:
				switch (this.state.subscriptionStatusResult.value.type) {
					case AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser:
						// use global state from props if active else products should be loading
						break;
					case AppleSubscriptionValidationResponseType.AssociatedWithAnotherUser:
						return (
							<span>Your subscription is associated with the following Readup account: {this.state.subscriptionStatusResult.value.subscribedUsername}</span>
						);
					case AppleSubscriptionValidationResponseType.EmptyReceipt:
						// products should be loading
						break;
				}
				break;
			case ResultType.Failure:
				return this.renderErrorContent(this.state.subscriptionStatusResult.error);
		}
		switch (this.state.productsResult.type) {
			case ResultType.Loading:
				return this.renderLoadingContent('Loading subscription options.');
			case ResultType.Success:
				return (
					<SubscriptionSelector
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
	private requestReceipt() {
		this._asyncTracker
			.addPromise(
				this.props.onRequestSubscriptionReceipt()
			)
			.then(
				result => {
					this.setState({
						receiptResult: mapAppResult(
							result,
							response => response,
							{
								[ReceiptRequestError.FileUrlNotFound]: 'Receipt file URL not found.'
							}
						)
					});
					if (result.type === ResultType.Success) {
						this.validateSubscription({
							base64EncodedReceipt: result.value.base64EncodedReceipt
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
						subscriptionStatusResult: {
							type: ResultType.Success,
							value: response
						}
					});
					if (
						response.type === AppleSubscriptionValidationResponseType.EmptyReceipt ||
						(
							response.type === AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser &&
							response.subscriptionStatus.type !== SubscriptionStatusType.Active
						)
					) {
						this.loadProducts();
					}
				}
			)
			.catch(
				reason => {
					mapPromiseErrorToResultIfNotCancelled(
						reason,
						result => {
							this.setState({
								subscriptionStatusResult: result
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
				title="Subscription Required"
			>
				<div className="app-store-subscription-prompt_7y5k2n">
					{this.renderContent()}
				</div>
			</Dialog>
		);
	}
}