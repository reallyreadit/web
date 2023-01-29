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
import { ClassValue } from 'classnames/types';

export interface SelectListOption {
	key: string | number;
	value?: string | number;
}
interface Props {
	className?: ClassValue;
	disabled?: boolean;
	onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	options: SelectListOption[];
	value: string | number;
}
export default class SelectList extends React.Component<Props> {
	private readonly _handleBlur = () => {
		// iOS select scroll bug
		if (window.scrollY !== 0) {
			window.scrollTo(0, 0);
		}
	};
	public render() {
		return (
			<select
				className={classNames('select-list_guiajx', this.props.className)}
				disabled={this.props.disabled}
				onBlur={this._handleBlur}
				onChange={this.props.onChange}
				value={this.props.value}
			>
				{this.props.options.map((option) => (
					<option
						key={option.key}
						value={option.value != null ? option.value : option.key}
					>
						{option.key}
					</option>
				))}
			</select>
		);
	}
}
