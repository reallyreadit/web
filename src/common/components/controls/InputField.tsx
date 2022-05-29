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
import FormField , { LabelPosition } from './FormField';
import InputControl, { Props } from './InputControl';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export { LabelPosition };
export default (props: Props & {
	className?: ClassValue,
	labelPosition?: LabelPosition,
	subtext?: string
}) => {
	const { className, labelPosition, ...inputControlProps } = props;
	return (
		<FormField
			label={props.label}
			className={classNames(props.className, 'input-field')}
			labelPosition={props.labelPosition}
			subtext={props.subtext}
		>
			<InputControl {...inputControlProps} />
		</FormField>
	)
};