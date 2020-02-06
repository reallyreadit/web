import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import Icon from './Icon';

export default (props: {
	className?: ClassValue,
	starred: boolean,
	busy: boolean,
	onClick: () => void
}) =>
	<div
		className={
			classNames(
				'star_n3lkaj',
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
			name="article-details-star"
			onClick={props.onClick}
		/>
	</div>;