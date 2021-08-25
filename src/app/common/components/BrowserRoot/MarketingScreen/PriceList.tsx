import * as React from 'react';
import { Props as PriceListItemProps, PriceListItem } from './PriceList/PriceListItem';

interface Props {
	prices: PriceListItemProps[]
}

export const PriceList: React.SFC<Props> = (props: Props) => (
	<ol className="price-list_eorvmi">
		{props.prices.map(
			price => (
				<PriceListItem
					amount={price.amount}
					description={price.description}
					key={price.title}
					selected={price.selected}
					title={price.title}
					subtitle={price.subtitle}
				/>
			)
		)}
	</ol>
);