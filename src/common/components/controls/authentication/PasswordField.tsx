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
import InputField, { LabelPosition } from '../InputField';

export default (props: {
	error: string,
	labelPosition?: LabelPosition,
	onChange: (value: string, error: string) => void,
	onEnterKeyPressed?: () => void,
	showError: boolean,
	value: string
}) => (
	<InputField
		error={props.error}
		label="Password"
		labelPosition={props.labelPosition}
		minLength={8}
		maxLength={256}
		onChange={props.onChange}
		onEnterKeyPressed={props.onEnterKeyPressed}
		required
		showError={props.showError}
		type="password"
		value={props.value}
	/>
);