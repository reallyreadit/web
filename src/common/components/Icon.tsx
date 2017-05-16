import * as React from 'react';

export type IconName = 'plus' | 'refresh2' | 'checkmark' | 'cancel' | 'backward' |
	'in-alt' | 'exclamation' | 'forbid' | 'spinner' | 'chat' | 'comments' |
	'write' | 'envelope' | 'user' | 'cog' | 'book' | 'refresh';
export default (props: {
	name: IconName,
	onClick?: () => void
}) =>
	<svg className="icon" onClick={props.onClick}><use xlinkHref={`#icon-${props.name}`}></use></svg>;