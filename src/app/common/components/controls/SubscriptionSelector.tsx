import * as React from 'react';
import { SubscriptionPriceSelection, StandardSubscriptionPriceLevel } from '../../../../common/models/subscriptions/SubscriptionPrice';
import Icon from '../../../../common/components/Icon';
import * as classNames from 'classnames';

type SubscriptionSelectorOption = StandardSubscriptionPriceLevel & {
	formattedAmount: string
};
type BaseProps = {
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
	public render() {
		return (
			<div className="subscription-selector_nuri7o">
				<label>Choose your Price</label>
				{this.props.options.map(
					product => (
						<button
							key={product.id}
							onClick={this._purchase}
							value={product.id}
						>
							<span className="name">{product.name}</span>
							<span className="price">{product.formattedAmount} / month</span>
						</button>
					)
				)}
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