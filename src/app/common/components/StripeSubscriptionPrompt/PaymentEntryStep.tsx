import * as React from 'react';
import ActionLink from '../../../../common/components/ActionLink';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import AsyncTracker, { CancellationToken } from '../../../../common/AsyncTracker';
import DialogSpinner from '../../../../common/components/Dialog/DialogSpinner';
import Button from '../../../../common/components/Button';
import HttpEndpoint, { createUrl } from '../../../../common/HttpEndpoint';
import { DisplayTheme, getClientPreferredColorScheme } from '../../../../common/models/userAccounts/DisplayPreference';
import { getPromiseErrorMessage } from '../../../../common/format';
import { Intent } from '../../../../common/components/Toaster';
import { SubscriptionPriceSelection, formatSubscriptionPriceName, formatSubscriptionPriceAmount } from '../../../../common/models/subscriptions/SubscriptionPrice';
import ContentBox from '../../../../common/components/ContentBox';
import { StripePaymentResponse, StripePaymentResponseType } from '../../../../common/models/subscriptions/StripePaymentResponse';

interface Props {
	displayTheme: DisplayTheme | null,
	onChangePrice: () => void,
	onShowToast: (content: string, intent: Intent) => void,
	onSubscribe: (card: StripeCardElement, price: SubscriptionPriceSelection) => Promise<StripePaymentResponse>,
	selectedPrice: SubscriptionPriceSelection,
	staticServerEndpoint: HttpEndpoint,
	stripe: Promise<Stripe> | null
}
enum StripeStatus {
	Initial,
	Loading,
	Loaded,
	Error
}
enum FormStatus {
	Incomplete,
	Error,
	Complete,
	Submitting
}
type FormState = {
	status: FormStatus.Incomplete | FormStatus.Complete | FormStatus.Submitting
} | {
	status: FormStatus.Error,
	message: string
};
interface State {
	formState: FormState,
	stripeStatus: StripeStatus
}
export default class PaymentEntryStep extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _cardElementRef: React.RefObject<HTMLDivElement>;
	private readonly _submit = () => {
		this.setState(
			prevState => {
				// only allow a single submission when complete
				if (prevState.formState.status !== FormStatus.Complete) {
					return null;
				}
				this._stripeCardElement.update({
					disabled: true
				});
				this._asyncTracker
					.addPromise(
						this.props.onSubscribe(this._stripeCardElement, this.props.selectedPrice)
					)
					.then(
						response => {
							switch (response.type) {
								case StripePaymentResponseType.Succeeded:
									this.props.onShowToast('Purchase completed.', Intent.Success);
									// leave form in Submitting state. the global subscription status change
									// will override the local state.
									break;
								case StripePaymentResponseType.Failed:
									this.props.onShowToast(`Purchase failed: ${response.errorMessage ?? 'Your card was declined.'}`, Intent.Danger);
									this._stripeCardElement.update({
										disabled: false
									});
									this.setState({
										formState: {
											status: FormStatus.Error,
											message: 'Please check your card details and try again.'
										}
									});
									break;
							}
						}
					)
					.catch(
						reason => {
							if ((reason as CancellationToken)?.isCancelled) {
								return;
							}
							this.props.onShowToast(`Purchase failed: ${getPromiseErrorMessage(reason)}`, Intent.Danger);
							this._stripeCardElement.update({
								disabled: false
							});
							this.setState({
								formState: {
									status: FormStatus.Error,
									message: 'Please check your card details and try again.'
								}
							});
						}
					);
				return {
					formState: {
						status: FormStatus.Submitting
					}
				};
			}
		);
	};
	private _stripe: Stripe | null;
	private _stripeCardElement: StripeCardElement | null;
	constructor(props: Props) {
		super(props);
		this.state = {
			formState: {
				status: FormStatus.Incomplete
			},
			stripeStatus: StripeStatus.Initial
		};
		this._cardElementRef = React.createRef();
	}
	private createStripeElements() {
		const elements = this._stripe.elements({
			fonts: this.createStripeFontsSource()
		});
		this._stripeCardElement = elements.create(
			'card',
			{
				style: this.createStripeElementStyle()
			}
		);
		this._stripeCardElement.on(
			'change',
			event => {
				let formState: FormState;
				if (event.error) {
					formState = {
						status: FormStatus.Error,
						message: event.error.message
					};
				} else {
					formState = {
						status: event.complete ?
							FormStatus.Complete :
							FormStatus.Incomplete
					};
				}
				this.setState({
					formState
				});
			}
		);
		this._stripeCardElement.mount(this._cardElementRef.current);
	}
	private createStripeElementStyle() {
		let
			color: string,     // $text-color
			iconColor: string; // $text-muted-color
		switch (
			this.props.displayTheme ?? getClientPreferredColorScheme()
		) {
			case DisplayTheme.Dark:
				color = '#c7c6c5';
				iconColor = '#888888';
				break;
			case DisplayTheme.Light:
				color = '#2a2326';
				iconColor = '#666666';
				break;
		}
		return {
			base: {
				color,
				fontFamily: 'museo-sans-300',
				fontSize: '17.33px',
				iconColor
			}
		};
	}
	private createStripeFontsSource() {
		return [
			{
				family: 'museo-sans-300',
				src: `url(${createUrl(this.props.staticServerEndpoint, '/common/fonts/museo-sans-300.ttf')})`
			}
		];
	}
	public componentDidMount() {
		if (!this.props.stripe) {
			this.setState({
				stripeStatus: StripeStatus.Error
			});
			return;
		}
		this._asyncTracker
			.addPromise(this.props.stripe)
			.then(
				stripe => {
					this._stripe = stripe;
					this.setState(
						{
							stripeStatus: StripeStatus.Loaded
						},
						() => {
							this.createStripeElements();
						}
					);
				}
			)
			.catch(
				reason => {
					if ((reason as CancellationToken)?.isCancelled) {
						return;
					}
					this.setState({
						stripeStatus: StripeStatus.Error
					});
				}
			);
		// stripe should already be loaded
		// delay the loading state to give the promise time to complete
		this._asyncTracker.addTimeout(
			window.setTimeout(
				() => {
					this.setState(
						prevState => {
							if (prevState.stripeStatus === StripeStatus.Initial) {
								return {
									stripeStatus: StripeStatus.Loading
								};
							}
							return null;
						}
					);
				},
				0
			)
		);
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			this.props.displayTheme !== prevProps.displayTheme &&
			this._stripeCardElement
		) {
			this._stripeCardElement.update({
				style: this.createStripeElementStyle()
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
		this._stripeCardElement?.unmount();
	}
	public render() {
		return (
			<div className="payment-entry-step_utsg1r">
				<ContentBox className="selection">
					<div className="title">Selected Subscription</div>
					<div className="name">{formatSubscriptionPriceName(this.props.selectedPrice)}</div>
					<div className="price">{formatSubscriptionPriceAmount(this.props.selectedPrice.amount)} / month</div>
					<ActionLink
						iconLeft="arrow-left"
						onClick={this.props.onChangePrice}
						state={
							this.state.formState.status === FormStatus.Submitting ?
								'disabled' :
								'normal'
						}
						text="Change"
					/>
				</ContentBox>
				{this.state.stripeStatus === StripeStatus.Loading ?
					<DialogSpinner message="Loading Stripe." /> :
					this.state.stripeStatus === StripeStatus.Error ?
						<div className="stripe-error">Failed to load Stripe.</div> :
						this.state.stripeStatus === StripeStatus.Loaded ?
							<div className="form">
								<div className="label">Payment Method</div>
								<div
									className="card-element"
									ref={this._cardElementRef}
								></div>
								{this.state.formState.status === FormStatus.Error ?
									<div className="card-element-error">
										{this.state.formState.message}
									</div> :
									null}
								<Button
									intent="loud"
									onClick={this._submit}
									size="large"
									state={
										this.state.formState.status === FormStatus.Complete ?
											'normal' :
											this.state.formState.status === FormStatus.Submitting ?
												'busy' :
												'disabled'
									}
									style="preferred"
									text="Subscribe"
								/>
							</div> :
							null}
			</div>
		);
	}
}