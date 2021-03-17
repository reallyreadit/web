import * as React from 'react';
import { SubscriptionPriceSelection, StandardSubscriptionPriceLevel, isStandardSubscriptionPriceLevel, formatSubscriptionPriceName, formatSubscriptionPriceAmount } from '../../../../common/models/subscriptions/SubscriptionPrice';
import Icon from '../../../../common/components/Icon';
import * as classNames from 'classnames';
import { ActiveSubscriptionStatus } from '../../../../common/models/subscriptions/SubscriptionStatus';

type SubscriptionSelectorOption = StandardSubscriptionPriceLevel & {
	formattedAmount: string
};
type BaseProps = {
	activeSubscription?: ActiveSubscriptionStatus,
	options: SubscriptionSelectorOption[]
};
type CustomPriceSelectionProps = BaseProps & {
	allowCustomPrice: true,
	onSelect: (price: SubscriptionPriceSelection) => void
};
type StandardPriceSelectionProps = BaseProps & {
	onSelect: (price: StandardSubscriptionPriceLevel) => void
};
type Props = CustomPriceSelectionProps | StandardPriceSelectionProps;
interface State {
	customAmount: string,
	customAmountError: string | null,
	isSettingCustomPrice: boolean
}
function isCustomPriceAllowed(props: Props): props is CustomPriceSelectionProps {
	return 'allowCustomPrice' in props;
}
function getNextPrice(status: ActiveSubscriptionStatus | null) {
	if (status == null) {
		return null;
	}
	return status.autoRenewEnabled ?
		status.autoRenewPrice :
		status.price;
}
export default class SubscriptionSelector extends React.Component<Props, State> {
	private readonly _changeCustomAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({
			customAmount: event.target.value,
			customAmountError: null
		});
	};
	private readonly _openPriceEditor = () => {
		if (!this.state.isSettingCustomPrice) {
			this.setState({
				isSettingCustomPrice: true
			});
		}
	};
	private readonly _purchase = (event: React.MouseEvent<HTMLButtonElement>) => {
		const selectedOption = this.props.options.find(
			option => option.id === event.currentTarget.value
		);
		this.props.onSelect({
			id: selectedOption.id,
			name: selectedOption.name,
			amount: selectedOption.amount
		});
	};
	private readonly _selectCustomPrice = () => {
		if (
			!isCustomPriceAllowed(this.props)
		) {
			return;
		}
		const match = this.state.customAmount
			.trim()
			.match(/^\$?\s*([\d,]+(\.\d{0,2})?)$/);
		if (match) {
			const
				stringValue = match[1].replace(/,/, ''),
				stringParts = stringValue.split('.'),
				multiplier = (
					stringParts.length === 1 || stringParts[1].length === 0 ?
						100 :
						stringParts[1].length === 1 ?
							10 :
							1
				),
				amount = (
					parseInt(
						stringValue.replace('.', ''),
						10
					) *
					multiplier
				);
			if (amount < 2500) {
				this.setState({
					customAmountError: 'Must be $25.00 or more.'
				});
			} else if (amount > 100000) {
				this.setState({
					customAmountError: 'Must be $1,000.00 or less.'
				});
			} else if (
				amount === getNextPrice(this.props.activeSubscription)?.amount
			) {
				this.setState({
					customAmountError: 'Must be a new amount.'
				});
			} else {
				this.props.onSelect({
					amount
				});
			}
		} else {
			this.setState({
				customAmountError: 'Invalid amount.'
			});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			customAmount: '',
			customAmountError: null,
			isSettingCustomPrice: false
		};
	}
	private renderButton(
		{
			id,
			name,
			formattedAmount,
			isSelected
		}: {
			id?: string,
			name: string,
			formattedAmount: string,
			isSelected: boolean
		}
	) {
		let selectionIndicator: React.ReactNode;
		if (isSelected) {
			const selectionLabel = (
					this.props.activeSubscription.autoRenewEnabled &&
					this.props.activeSubscription.autoRenewPrice.id !== this.props.activeSubscription.price.id
				) ?
					'Next Price' :
					'Current Price';
			selectionIndicator = (
				<span className="selected">
					<Icon name="checkmark" /> {selectionLabel}
				</span>
			);
		}
		return (
			<button
				disabled={isSelected}
				key={id}
				onClick={
					isSelected ?
						null :
						this._purchase
				}
				value={id}
			>
				<span className="name">{name}</span>
				<span className="price">{formattedAmount} / month</span>
				{selectionIndicator}
			</button>
		);
	}
	public render() {
		const nextPrice = getNextPrice(this.props.activeSubscription);
		return (
			<div className="subscription-selector_nuri7o">
				<label>Choose your Price</label>
				{this.props.options.map(
					product => this.renderButton({
						id: product.id,
						name: product.name,
						formattedAmount: product.formattedAmount,
						isSelected: (
							nextPrice != null &&
							isStandardSubscriptionPriceLevel(nextPrice) &&
							nextPrice.id === product.id
						)
					})
				)}
				{(
					nextPrice != null &&
					!isStandardSubscriptionPriceLevel(nextPrice)
				) ?
					this.renderButton({
						name: formatSubscriptionPriceName(nextPrice),
						formattedAmount: formatSubscriptionPriceAmount(nextPrice.amount),
						isSelected: true
					}) :
					null}
				{isCustomPriceAllowed(this.props) ?
					<div className="custom-price-control">
						<label
							className={
								classNames({ 'link': !this.state.isSettingCustomPrice })
							}
							onClick={this._openPriceEditor}
						>
							Set Custom Price
						</label>
						{this.state.isSettingCustomPrice ?
							<div className="form">
								<div className="controls">
									<span className="prefix">$</span>
									<input
										onChange={this._changeCustomAmount}
										type="text"
										value={this.state.customAmount}
									/>
									<span className="suffix">/ month</span>
									<Icon
										onClick={this._selectCustomPrice}
										name="arrow-right"
									/>
								</div>
								{this.state.customAmountError ?
									<div className="error">{this.state.customAmountError}</div> :
									null}
							</div> :
							null}
					</div> :
					null}
			</div>
		);
	}
}