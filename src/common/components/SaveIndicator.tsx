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
import SpinnerIcon from './SpinnerIcon';
import Icon from './Icon';
import classNames from 'classnames';

export enum State {
	None,
	Saving,
	Saved
}
export default (
	props: {
		state: State
	}
) => (
	props.state === State.Saving ?
		<SpinnerIcon className="save-indicator_5lgdsz" /> :
		<Icon
			className={
				classNames(
					'save-indicator_5lgdsz',
					{
						'none': props.state === State.None,
						'saved': props.state === State.Saved
					}
				)
			}
			name="checkmark"
		/>
);