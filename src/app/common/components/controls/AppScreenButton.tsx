import * as React from 'react';
import * as className from 'classnames';
import Spinner from '../../../../common/components/Spinner';

export default (props: {
	busy?: boolean,
	onClick: () => void,
	style?: 'loud',
	text: string
}) => (
	<button
		className={className('app-screen-button', {
			'busy': props.busy,
			'loud': props.style === 'loud'
		})}
		disabled={props.busy}
		onClick={props.onClick}
	>
		{props.busy ?
			<Spinner /> :
			null}
		{props.text}
		{props.busy ?
			<Spinner /> :
			null}
	</button>
);