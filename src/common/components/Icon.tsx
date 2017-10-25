import * as React from 'react';
import * as className from 'classnames';

export type IconName = 'locked' | 'switch' | 'plus' | 'refresh2' | 'checkmark' |
	'cancel' | 'backward' | 'exclamation' | 'forbid' | 'spinner' | 'comments' |
	'write' | 'envelope' | 'user' | 'cog' | 'book' | 'refresh' | 'lightbulb' |
	'question' | 'hyperlink' | 'gallery' | 'star' | 'clock' | 'key';
export default (props: {
	name: IconName,
	className?: ClassValue,
	onClick?: () => void
}) =>
	<svg
		className={className('icon', props.className)}
		onClick={props.onClick}>
			<use xlinkHref={`#icon-${props.name}`}></use>
	</svg>;