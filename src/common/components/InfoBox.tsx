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
import Icon, { IconName } from './Icon';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export default (props: {
	children: React.ReactNode;
	className?: ClassValue;
	icon?: IconName;
	style: 'normal' | 'warning' | 'success';
}) => (
	<div
		className={classNames('info-box_8xzdd8', props.className, {
			success: props.style === 'success',
			warning: props.style === 'warning',
		})}
	>
		<div className="box">
			{props.icon ? (
				<div className="icon-container">
					<Icon name={props.icon} />
				</div>
			) : null}
			<div className="content">{props.children}</div>
		</div>
	</div>
);
