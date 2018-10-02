import * as React from 'react';
import Icon, { IconName } from '../../../../common/components/Icon';
import classNames from 'classnames';

export default (props: {
	items: {
		iconName: IconName,
		label: string,
		isSelected: boolean
	}[]
}) => (
	<ol className="app-nav">
		{props.items.map(item => (
			<li
				className={classNames(
					'nav-item', 
					{ 'selected': item.isSelected }
				)}
				key={item.label}
			>
				<Icon name={item.iconName} />
				<label>{item.label}</label>
			</li>
		))}
	</ol>
);