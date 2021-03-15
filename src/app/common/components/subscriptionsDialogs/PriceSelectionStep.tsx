import * as React from 'react';
import { SubscriptionPrice, StandardSubscriptionPriceLevel, formatSubscriptionPriceAmount } from '../../../../common/models/subscriptions/SubscriptionPrice';
import SubscriptionSelector from '../controls/SubscriptionSelector';

interface Props {
	allowCustomPrice: boolean,
	onSelectPrice: (price: SubscriptionPrice) => void,
	priceLevels: StandardSubscriptionPriceLevel[]
}
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