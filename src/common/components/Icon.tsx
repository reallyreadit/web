import * as React from 'react';
import * as className from 'classnames';

export type IconName = 'locked' | 'switch' | 'plus' | 'refresh2' | 'checkmark' |
	'cancel' | 'backward' | 'exclamation' | 'forbid' | 'spinner' | 'comments' |
	'write' | 'envelope' | 'user' | 'cog' | 'book' | 'refresh' | 'lightbulb' |
	'question' | 'hyperlink' | 'gallery' | 'star' | 'clock' | 'key' | 'trophy' |
	'home' | 'box' | 'star-empty' | 'email' | 'share';
export default (props: {
	name: IconName,
	title?: string,
	className?: ClassValue,
	onClick?: () => void
}) =>
	<svg
		className={className('icon', props.className)}
		onClick={props.onClick}
	>
		{props.title ?
			<title>{props.title}</title> :
			null}
		<use xlinkHref={`#icon-${props.name}`}></use>
	</svg>;