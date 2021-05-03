import * as React from 'react';
import { SubscriptionStatus, SubscriptionStatusType } from '../../../../common/models/subscriptions/SubscriptionStatus';
import { SubscriptionPaymentMethod, SubscriptionPaymentMethodBrand } from '../../../../common/models/subscriptions/SubscriptionPaymentMethod';
import ContentBox from '../../../../common/components/ContentBox';
import Link from '../../../../common/components/Link';
import { formatSubscriptionPriceName, formatSubscriptionPriceAmount, SubscriptionPriceLevel } from '../../../../common/models/subscriptions/SubscriptionPrice';
import { DateTime } from 'luxon';
import { formatIsoDateAsUtc } from '../../../../common/format';
import Icon from '../../../../common/components/Icon';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import UserArticle from '../../../../common/models/UserArticle';
import { DeviceType } from '../../../../common/DeviceType';
import AsyncTracker, { CancellationToken } from '../../../../common/AsyncTracker';
import Popover, { MenuState, MenuPosition } from '../../../../common/components/Popover';
import Button from '../../../../common/components/Button';

interface Props {
	deviceType: DeviceType,
	onOpenChangePaymentMethodDialog: () => void,
	onOpenPaymentConfirmationDialog: (invoiceId: string) => void,
	onOpenPriceChangeDialog: () => void,
	onOpenSubscriptionAutoRenewDialog: () => Promise<void>,
	onOpenSubscriptionPromptDialog: (article?: UserArticle, provider?: SubscriptionProvider) => void,
	onOpenUpdatePaymentMethodDialog: () => void,
	paymentMethod: SubscriptionPaymentMethod | null
	status: SubscriptionStatus
}
interface State {
	changeCardMenuState: MenuState,
	isChangingAutoRenewStatus: boolean
}
export default class SubscriptionControl extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _beginClosingChangeCardMenu = () => {
		this.setState({
			changeCardMenuState: MenuState.Closing
		});
	};
	private readonly _closeChangeCardMenu = () => {
		this.setState({
			changeCardMenuState: MenuState.Closed
		});
	};
	private readonly _openChangeCardMenu = () => {
		this.setState({
			changeCardMenuState: MenuState.Opened
		});
	};
	private readonly _openChangePaymentMethodDialog = () => {
		this.props.onOpenChangePaymentMethodDialog();
		this._beginClosingChangeCardMenu();
	};
	private readonly _openPaymentConfirmationDialog = () => {
		if (this.props.status.type === SubscriptionStatusType.PaymentConfirmationRequired) {
			this.props.onOpenPaymentConfirmationDialog(this.props.status.invoiceId);
		}
	};
	private readonly _openSubscriptionAutoRenewDialog = () => {
		this.setState({
			isChangingAutoRenewStatus: true
		});
		this._asyncTracker
			.addPromise(
				this.props.onOpenSubscriptionAutoRenewDialog()
			)
			.then(
				() => {
					this.setState({
						isChangingAutoRenewStatus: false
					});
				}
			)
			.catch(
				reason => {
					if ((reason as CancellationToken)?.isCancelled) {
						return;
					}
					this.setState({
						isChangingAutoRenewStatus: false
					});
				}
			);
	};
	private readonly _openSubscriptionPromptDialog = () => {
		this.props.onOpenSubscriptionPromptDialog();
	};
	private readonly _openUpdatePaymentMethodDialog = () => {
		this.props.onOpenUpdatePaymentMethodDialog();
		this._beginClosingChangeCardMenu();
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			changeCardMenuState: MenuState.Closed,
			isChangingAutoRenewStatus: false
		};
	}
	private getCreditCardIcon(brand: SubscriptionPaymentMethodBrand) {
		switch (brand) {
			case SubscriptionPaymentMethodBrand.Amex:
				return 'cc-amex';
			case SubscriptionPaymentMethodBrand.Diners:
				return 'cc-diners-club';
			case SubscriptionPaymentMethodBrand.Discover:
				return 'cc-discover';
			case SubscriptionPaymentMethodBrand.Jcb:
				return 'cc-jcb';
			case SubscriptionPaymentMethodBrand.Mastercard:
				return 'cc-mastercard';
			case SubscriptionPaymentMethodBrand.Visa:
				return 'cc-visa';
			default:
				return 'credit-card';
		}
	}
	private renderSubscriptionDetails(price: SubscriptionPriceLevel) {
		return (
			<>
				<div className="price-name">{formatSubscriptionPriceName(price)}</div>
				<div className="price-amount">{formatSubscriptionPriceAmount(price)} / month</div>
			</>
		);
	}
	private renderContent() {
		if (this.props.status.type === SubscriptionStatusType.NeverSubscribed) {
			return (
				<>
					{this.props.status.isUserFreeForLife ?
						<>
							<div className="title">Free for Life</div>
							<div className="message">Subscribe to Support Writers and Readup.</div>
						</> :
						<>
							<div className="title">Never Subscribed</div>
							<div className="message">Subscribe to Start Reading.</div>
						</>}
					<div className="actions">
						<Link
							onClick={this._openSubscriptionPromptDialog}
							text="See Options"
						/>
					</div>
				</>
			);
		}
		if (this.props.status.type === SubscriptionStatusType.PaymentConfirmationRequired) {
			return (
				<>
					<div className="title">Subscription Incomplete</div>
					{this.renderSubscriptionDetails(this.props.status.price)}
					<div className="message">Payment confirmation required.</div>
					<div className="actions">
						<Link
							onClick={this._openPaymentConfirmationDialog}
							text="Confirm Payment"
						/>
						<Link
							onClick={this._openSubscriptionPromptDialog}
							text="Start New Subscription"
						/>
					</div>
				</>
			);
		}
		if (this.props.status.type === SubscriptionStatusType.PaymentFailed) {
			return (
				<>
					<div className="title">Subscription Incomplete</div>
					{this.renderSubscriptionDetails(this.props.status.price)}
					<div className="message">Initial payment failed.</div>
					<div className="actions">
						<Link
							onClick={this._openSubscriptionPromptDialog}
							text="Start New Subscription"
						/>
					</div>
				</>
			);
		}
		if (this.props.status.type === SubscriptionStatusType.Active) {
			// renewal message
			const formattedEndDate = DateTime
				.fromISO(
					formatIsoDateAsUtc(this.props.status.currentPeriodRenewalGracePeriodEndDate)
				)
				.toLocaleString(DateTime.DATE_MED);
			let renewalMessage: React.ReactNode;
			if (this.props.status.autoRenewEnabled) {
				if (this.props.status.autoRenewPrice.amount === this.props.status.price.amount) {
					renewalMessage = `Will renew on ${formattedEndDate}.`;
				} else {
					renewalMessage = <>Will renew on {formattedEndDate} at <span className="nowrap">{formatSubscriptionPriceAmount(this.props.status.autoRenewPrice)} / month.</span></>
				}
			} else {
				renewalMessage = `Will end on ${formattedEndDate}.`;
			}
			return (
				<>
					<div className="title">Subscription Active</div>
					{this.renderSubscriptionDetails(this.props.status.price)}
					{this.props.status.provider === SubscriptionProvider.Stripe ?
						this.props.paymentMethod ?
							<div className="payment-info">
								<Icon
									name={this.getCreditCardIcon(this.props.paymentMethod.brand)}
								/>
								<span className="last-four">…{this.props.paymentMethod.lastFourDigits}</span>
								<span className="expiration">{this.props.paymentMethod.expirationMonth}/{this.props.paymentMethod.expirationYear.toString().substring(2)}</span>
								<Popover
									menuChildren={
										<span className="content">
											<Button
												align="center"
												display="block"
												onClick={this._openUpdatePaymentMethodDialog}
												text="Update Exp. Date"
											/>
											<Button
												align="center"
												display="block"
												onClick={this._openChangePaymentMethodDialog}
												text="Use Another Card"
											/>
										</span>
									}
									menuPosition={MenuPosition.BottomRight}
									menuState={this.state.changeCardMenuState}
									onBeginClosing={this._beginClosingChangeCardMenu}
									onClose={this._closeChangeCardMenu}
									onOpen={this._openChangeCardMenu}
								>
									<Link
										onClick={this._openChangeCardMenu}
										state={this.state.isChangingAutoRenewStatus ? 'disabled' : 'normal'}
										text="Change Card"
									/>
								</Popover>
							</div> :
							<div className="message">Loading payment method...</div> :
						<div className="message">Billed through Apple.</div>}
					<div className="message">{renewalMessage}</div>
					{this.props.status.provider === SubscriptionProvider.Stripe || this.props.deviceType === DeviceType.Ios ?
						<div className="actions">
								<Link
									onClick={this.props.onOpenPriceChangeDialog}
									state={this.state.isChangingAutoRenewStatus ? 'disabled' : 'normal'}
									text="Change Price"
								/>
								<Link
									onClick={this._openSubscriptionAutoRenewDialog}
									state={this.state.isChangingAutoRenewStatus ? 'busy' : 'normal'}
									text={this.props.status.autoRenewEnabled ? 'Cancel' : 'Resume'}
								/>
						</div> :
						<div className="message">
							Manage your subscription on your Apple device or in <a href="https://apps.apple.com/account/subscriptions" target="_blank">iTunes</a>.
						</div>}
				</>
			);
		}
		return (
			<>
				<div className="title">Subscription Inactive</div>
				{this.renderSubscriptionDetails(this.props.status.price)}
				<div className="message">
					{this.props.status.lastPeriodDateRefunded ?
						`Refunded on ${DateTime.fromISO(formatIsoDateAsUtc(this.props.status.lastPeriodDateRefunded)).toLocaleString(DateTime.DATE_MED)}.` :
						`Ended on ${DateTime.fromISO(formatIsoDateAsUtc(this.props.status.lastPeriodRenewalGracePeriodEndDate)).toLocaleString(DateTime.DATE_MED)}.`}
				</div>
				<div className="actions">
					<Link
						onClick={this._openSubscriptionPromptDialog}
						text="See Options"
					/>
				</div>
			</>
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ContentBox className="subscription-control_ryw1sb">
				{this.renderContent()}
			</ContentBox>
		);
	}
}