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
	autoFocus?: boolean;
	error: string;
	labelPosition?: LabelPosition;
	onChange: (value: string, error?: string) => void;
	onEnterKeyPressed?: () => void;
	showError: boolean;
	value: string;
}) => (
	<InputField
		autoCapitalize="none"
		autoFocus={props.autoFocus}
		error={props.error}
		label="Reader Name"
		labelPosition={props.labelPosition}
		minLength={3}
		maxLength={30}
		onChange={props.onChange}
		onEnterKeyPressed={props.onEnterKeyPressed}
		required
		showError={props.showError}
		subtext="Your reader name will be public, but you can choose to be as anonymous as you wish. (ex: JenFox or Human123)"
		type="username"
		value={props.value}
	/>
);
