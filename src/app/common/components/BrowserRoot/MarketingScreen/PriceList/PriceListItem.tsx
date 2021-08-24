import * as React from 'react';
// import { formatCurrency } from '../../../../../../common/format';
import * as classNames from 'classnames';
import ContentBox from '../../../../../../common/components/ContentBox';

export interface Props {
	amount: string,
	description: JSX.Element,
	selected?: boolean,
	title: string
}

export const PriceListItem: React.FunctionComponent<Props> = (props: Props) => (
	<li className={classNames('price-list-item_7j8olx', { 'selected': props.selected })}>
		<ContentBox>
			<div className="title">{props.title}</div>
			<div className="description">{props.description}</div>
			<div className="price">{props.amount}</div>
		</ContentBox>
	</li>
);