import * as React from 'react';
import { SubscriptionStatus, SubscriptionStatusType } from '../../../../common/models/subscriptions/SubscriptionStatus';
import { SubscriptionPaymentMethod, SubscriptionPaymentMethodBrand } from '../../../../common/models/subscriptions/SubscriptionPaymentMethod';
import ContentBox from '../../../../common/components/ContentBox';
import ActionLink from '../../../../common/components/ActionLink';
import { formatSubscriptionPriceName, formatSubscriptionPriceAmount, SubscriptionPrice } from '../../../../common/models/subscriptions/SubscriptionPrice';
import { DateTime } from 'luxon';
import { formatIsoDateAsUtc } from '../../../../common/format';
import Icon from '../../../../common/components/Icon';
import SubscriptionProvider from '../../../../common/models/subscriptions/SubscriptionProvider';
import UserArticle from '../../../../common/models/UserArticle';
import { DeviceType } from '../../../../common/DeviceType';

interface Props {
	deviceType: DeviceType,
	onOpenSubscriptionPromptDialog: (article?: UserArticle, provider?: SubscriptionProvider) => void,
	paymentMethod: SubscriptionPaymentMethod | null
	status: SubscriptionStatus
}
interface State {

}
export default class SubscriptionControl extends React.Component<Props, State> {
	private readonly _openSubscriptionPromptDialog = () => {
		this.props.onOpenSubscriptionPromptDialog();
	};
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
	private renderSubscriptionDetails(price: SubscriptionPrice) {
		return (
			<>
				<div className="price-name">{formatSubscriptionPriceName(price)}</div>
				<div className="price-amount">{formatSubscriptionPriceAmount(price.amount)} / month</div>
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
							<div className="message">Subscribe to Support Writers and Readup</div>
						</> :
						<>
							<div className="title">Never Subscribed</div>
							<div className="message">Subscribe to Start Reading</div>
						</>}
					<div className="actions">
						<ActionLink
							onClick={this._openSubscriptionPromptDialog}
							text="See Options"
						/>
					</div>
				</>
			);
		}
		if (this.props.status.type === SubscriptionStatusType.Incomplete) {
			return (
				<>
					<div className="title">Subscription Incomplete</div>
					{this.renderSubscriptionDetails(this.props.status.price)}
					<div className="message">
						{this.props.status.requiresConfirmation ?
							'Payment confirmation required' :
							'Initial payment failed'}
					</div>
					<div className="actions">
						{this.props.status.requiresConfirmation ?
							<ActionLink text="Confirm Payment" /> :
							null}
						<ActionLink
							onClick={this._openSubscriptionPromptDialog}
							text="Start New Subscription"
						/>
					</div>
				</>
			);
		}
		if (this.props.status.type === SubscriptionStatusType.Active) {
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
								<span className="last-four">****-{this.props.paymentMethod.lastFourDigits}</span>
								<span className="expiration">{this.props.paymentMethod.expirationMonth}/{this.props.paymentMethod.expirationYear.toString().substring(2)}</span>
							</div> :
							<div className="message">Loading payment method...</div> :
						<div className="message">Billed through Apple</div>}
					<div className="message">Will renew on {DateTime.fromISO(formatIsoDateAsUtc(this.props.status.currentPeriodEndDate)).toLocaleString(DateTime.DATE_MED)}</div>
					{this.props.status.provider === SubscriptionProvider.Stripe ?
						this.props.paymentMethod ?
							<div className="actions">
								<ActionLink text="Change Card" />
								<ActionLink text="Update Card" />
								<ActionLink text="Change Plan" />
								<ActionLink text="Cancel Plan" />
							</div> :
							null :
						<div className="actions">
							<ActionLink text="Change Plan" />
							<ActionLink text="Cancel Plan" />
						</div>}
				</>
			);
		}
		return (
			<>
				<div className="title">Subscription Inactive</div>
				{this.renderSubscriptionDetails(this.props.status.price)}
				<div className="message">Ended on {DateTime.fromISO(formatIsoDateAsUtc(this.props.status.lastPeriodEndDate)).toLocaleString(DateTime.DATE_MED)}</div>
				<div className="actions">
					<ActionLink
						onClick={this._openSubscriptionPromptDialog}
						text="See Options"
					/>
				</div>
			</>
		);
	}
	public render() {
		return (
			<ContentBox className="subscription-control_ryw1sb">
				{this.renderContent()}
			</ContentBox>
		);
	}
}