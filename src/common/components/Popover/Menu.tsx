import * as React from 'react';
import classNames from 'classnames';
import { MenuPosition } from '../Popover';

export default (props: {
	children: React.ReactNode,
	isClosing: boolean,
	onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void,
	position: MenuPosition,
	stopPropagation?: boolean
}) => {
	const menuPosition = props.position.split('/');
	return (
		<span
			className={
				classNames(
					'menu_qla37i',
					'menu',
					'position-' + menuPosition[0],
					'align-' + menuPosition[1],
					{ 'closing': props.isClosing }
				)
			}
			onMouseDown={props.onMouseDown}
			onClick={(e) => {
				if (props.stopPropagation) e.stopPropagation();
			}}
		>
			{props.children}
		</span>
	);
};