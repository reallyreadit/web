import * as React from 'react';
import * as className from 'classnames';
import Icon from './Icon';

export default (props: {
	className?: ClassValue,
	starred: boolean,
	busy: boolean,
	onClick: () => void
}) =>
	<div
		className={
			className(
				'star',
				{
					starred: props.starred,
					busy: props.busy
				},
				props.className
			)
		}
		title={props.starred ? 'Unstar Article' : 'Star Article'}
	>
		<Icon
			name="star"
			onClick={props.onClick}
		/>
	</div>;