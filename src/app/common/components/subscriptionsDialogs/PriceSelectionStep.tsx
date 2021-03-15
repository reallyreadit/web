import * as React from 'react';
import { SubscriptionPriceSelection, StandardSubscriptionPriceLevel, formatSubscriptionPriceAmount } from '../../../../common/models/subscriptions/SubscriptionPrice';
import SubscriptionSelector from '../controls/SubscriptionSelector';

type BaseProps = {
	priceLevels: StandardSubscriptionPriceLevel[]
};
type CustomSelectionProps = BaseProps & {
	allowCustomPrice: true,
	onSelectPrice: (price: SubscriptionPriceSelection) => void
};
type StandardPriceSelectionProps = BaseProps & {
	onSelectPrice: (price: StandardSubscriptionPriceLevel) => void
};
type Props = CustomSelectionProps & StandardPriceSelectionProps;
interface State {

}
export default class PriceSelectionStep extends React.Component<Props, State> {
	public render() {
		return (
			<div className="price-selection-step_hbqey2">
				<SubscriptionSelector
					allowCustomPrice={this.props.allowCustomPrice}
					onSelect={this.props.onSelectPrice}
					options={
						this.props.priceLevels.map(
							priceLevel => ({
								...priceLevel,
								formattedAmount: formatSubscriptionPriceAmount(priceLevel.amount)
							})
						)
					}
				/>
			</div>
		);
	}
}