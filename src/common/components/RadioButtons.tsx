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

interface Props {
	onChange: (value: string) => void;
	options: {
		key: string;
		value?: string;
	}[];
	value: string;
}
export default class RadioButtons extends React.Component<Props> {
	private readonly _change = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onChange(event.target.value);
	};
	public render() {
		return (
			<span className="radio-buttons_sdytcf">
				{this.props.options.map((option) => {
					const value = option.value != null ? option.value : option.key;
					return (
						<label key={option.key}>
							<input
								type="radio"
								value={value}
								checked={value === this.props.value}
								onChange={this._change}
							/>
							<span>{option.key}</span>
						</label>
					);
				})}
			</span>
		);
	}
}
