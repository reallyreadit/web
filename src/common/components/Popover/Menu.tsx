// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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