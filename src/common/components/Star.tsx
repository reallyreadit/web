import * as React from 'react';
import * as className from 'classnames';
import Icon from './Icon';

export default (props: {
	starred: boolean,
	busy: boolean,
	onClick: () => void
}) =>
	<div
		className={
			className('star', {
				starred: props.starred,
				busy: props.busy
			})
		}
		title={props.starred ? 'Unstar Article' : 'Star Article'}
	>
		<Icon
			name="star"
			onClick={props.onClick}
		/>
	</div>;