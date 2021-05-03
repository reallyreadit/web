import * as React from 'react';
import { formatCurrency } from '../../../../../../common/format';
import * as classNames from 'classnames';

export interface Props {
	amount: number,
	description: string,
	selected?: boolean,
	title: string
}

export const PriceListItem: React.SFC<Props> = (props: Props) => (
	<li className={classNames('price-list-item_7j8olx', { 'selected': props.selected })}>
		<div className="price">{formatCurrency(props.amount)}</div>
		<div className="title">{props.title}</div>
		<div className="description">{props.description}</div>
	</li>
);