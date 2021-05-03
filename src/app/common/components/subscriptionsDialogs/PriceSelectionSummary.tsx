import * as React from 'react';
import ContentBox from '../../../../common/components/ContentBox';
import { formatSubscriptionPriceName, formatSubscriptionPriceAmount, SubscriptionPriceSelection } from '../../../../common/models/subscriptions/SubscriptionPrice';
import Link from '../../../../common/components/Link';

interface Props {
	disabled?: boolean,
	onChangePrice?: () => void,
	selectedPrice: SubscriptionPriceSelection
}
export const PriceSelectionSummary: React.SFC<Props> = (props: Props) => (
	<ContentBox className="price-selection-summary_8w3t0z">
		<div className="title">Selected Subscription</div>
		<div className="name">{formatSubscriptionPriceName(props.selectedPrice)}</div>
		<div className="price">{formatSubscriptionPriceAmount(props.selectedPrice)} / month</div>
		{props.onChangePrice ?
			<Link
				iconLeft="arrow-left"
				onClick={props.onChangePrice}
				state={
					props.disabled ?
						'disabled' :
						'normal'
				}
				text="Change"
			/> :
			null}
	</ContentBox>
);