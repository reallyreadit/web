import * as React from 'react';
import classNames from 'classnames';
import Spinner from '../../../../common/components/Spinner';
import Icon, { IconName } from '../../../../common/components/Icon';

function createIconElement(icon: IconName, busy: boolean) {
	return (
		busy ?
			<Spinner /> :
			icon ?
				<Icon name={icon} /> :
				null
	);
}
export default (props: {
	busy?: boolean,
	icon?: IconName,
	onClick: () => void,
	style?: 'loud',
	text: string
}) => (
	<button
		className={classNames('app-screen-button', {
			'busy': props.busy,
			'loud': props.style === 'loud'
		})}
		disabled={props.busy}
		onClick={props.onClick}
	>
		{createIconElement(props.icon, props.busy)}
		{props.text}
		{createIconElement(props.icon, props.busy)}
	</button>
);