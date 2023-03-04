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
import ToggleSwitch from './ToggleSwitch';
import SaveIndicator, { State as SaveIndicatorState } from './SaveIndicator';
import { ClassValue } from 'classnames/types';
import * as classNames from 'classnames';

interface Props {
	children?: React.ReactNode;
	className?: ClassValue;
	isEnabled: boolean;
	onChange: (isEnabled: boolean) => void;
	saveIndicator: SaveIndicatorState;
	subtitle?: string;
	title: string;
}
export default class ToggleSwitchExpandableInput extends React.PureComponent<Props> {
	private readonly _toggleEnabled = () => {
		this.props.onChange(!this.props.isEnabled);
	};
	public render() {
		return (
			<div
				className={classNames(
					'toggle-switch-expandable-input_i54wnk',
					this.props.className
				)}
			>
				<div className="switch-container">
					<ToggleSwitch
						isChecked={this.props.isEnabled}
						onChange={this._toggleEnabled}
					/>
				</div>
				<div className="controls">
					<div className="header">
						<label onClick={this._toggleEnabled}>{this.props.title}</label>
						{this.props.subtitle ? <span>{this.props.subtitle}</span> : null}
						<SaveIndicator state={this.props.saveIndicator} />
					</div>
					<div className="children">{this.props.children}</div>
				</div>
			</div>
		);
	}
}
