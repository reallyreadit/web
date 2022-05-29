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
import AsyncTracker, { CancellationToken } from '../AsyncTracker';
import { State as SaveIndicatorState } from './SaveIndicator';
import ToggleSwitchExpandableInput from './ToggleSwitchExpandableInput';
import { ClassValue } from 'classnames/types';
import * as classNames from 'classnames';

interface Props {
	className?: ClassValue,
	isEnabled: boolean,
	onChange: (value: string, isEnabled: boolean) => Promise<any> | void,
	subtitle?: string,
	title: string,
	value?: string
}
interface State {
	indicator: SaveIndicatorState
}
export default class ToggleSwitchInput extends React.PureComponent<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private _isSaving = false;
	private readonly _toggleEnabled = (isEnabled: boolean) => {
		if (this._isSaving) {
			return;
		}
		const changePromise = this.props.onChange(this.props.value, isEnabled);
		if (changePromise) {
			this._isSaving = true;
			this.setState({
				indicator: SaveIndicatorState.Saving
			});
			this._asyncTracker
				.addPromise(changePromise)
				.then(
					() => {
						this._isSaving = false;
						this.setState({
							indicator: SaveIndicatorState.Saved
						});
					}
				)
				.catch(
					reason => {
						if ((reason as CancellationToken)?.isCancelled) {
							return;
						}
						this._isSaving = false;
						this.setState({
							indicator: SaveIndicatorState.None
						});
					}
				);
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			indicator: SaveIndicatorState.None
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ToggleSwitchExpandableInput
				className={classNames('toggle-switch-input_hnmxln', this.props.className)}
				isEnabled={this.props.isEnabled}
				onChange={this._toggleEnabled}
				saveIndicator={this.state.indicator}
				subtitle={this.props.subtitle}
				title={this.props.title}
			/>
		);
	}
}