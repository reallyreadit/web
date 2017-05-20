import * as React from 'react';

export type IconName = 'locked' | 'switch' | 'plus' | 'refresh2' | 'checkmark' |
	'cancel' | 'backward' | 'exclamation' | 'forbid' | 'spinner' | 'comments' |
	'write' | 'envelope' | 'user' | 'cog' | 'book' | 'refresh';
export default (props: {
	name: IconName,
	onClick?: () => void
}) =>
	<svg className="icon" onClick={props.onClick}><use xlinkHref={`#icon-${props.name}`}></use></svg>;