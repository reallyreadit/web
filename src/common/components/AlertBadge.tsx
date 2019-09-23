import * as React from 'react';
import classNames from 'classnames';

export default (
	props: {
		count: number
	}
) => (
	<span
		className={
			classNames(
				'alert-badge_ejzklr',
				{ 'hidden': !props.count }
			)
		}
	>
		{props.count}
	</span>
);