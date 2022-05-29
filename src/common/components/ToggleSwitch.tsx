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

export default class ToggleSwitch extends React.PureComponent<{
	isChecked: boolean,
	onChange: (checked: boolean) => void
}> {
	private readonly _change = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.props.onChange(event.currentTarget.checked);
	};
	public render() {
		return (
			<label className="toggle-switch_t7od1q">
				<input
					type="checkbox"
					checked={this.props.isChecked}
					onChange={this._change}
				/>
				<span className="switch"></span>
			</label>
		);
	}
}