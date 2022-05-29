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
import RadioButtons from '../../../../common/components/RadioButtons';
import DisplayPreference, { DisplayTheme } from '../../../../common/models/userAccounts/DisplayPreference';
import SaveIndicator, { State as SaveIndicatorState } from '../../../../common/components/SaveIndicator';
import AsyncTracker from '../../../../common/AsyncTracker';

const
	themeOptions = [
		{
			key: 'Light',
			value: DisplayTheme.Light.toString()
		},
		{
			key: 'Dark',
			value: DisplayTheme.Dark.toString()
		}
	];
interface Props {
	onChangeDisplayPreference: (preference: DisplayPreference) => Promise<DisplayPreference>,
	preference: DisplayPreference | null
}
interface State {
	saveIndicatorState: SaveIndicatorState
}
export default class DisplayPreferencesControl extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _setTheme = (value: string) => {
		const theme = parseInt(value) as DisplayTheme;
		this.setState({
			saveIndicatorState: SaveIndicatorState.Saving
		});
		this.props
			.onChangeDisplayPreference({
				...this.props.preference,
				theme
			})
			.then(
				this._asyncTracker.addCallback(
					preference => {
						this.setState({
							saveIndicatorState: SaveIndicatorState.Saved
						});
					}
				)
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			saveIndicatorState: (
				props.preference ?
					SaveIndicatorState.None :
					SaveIndicatorState.Saving
			)
		};
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			prevProps.preference == null &&
			this.props.preference != null &&
			this.state.saveIndicatorState === SaveIndicatorState.Saving
		) {
			this.setState({
				saveIndicatorState: SaveIndicatorState.None
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className="display-preferences-control_tscub0">
				<label>Theme</label>
				<RadioButtons
					onChange={this._setTheme}
					options={themeOptions}
					value={this.props.preference?.theme.toString() ?? ''}
				/>
				<SaveIndicator state={this.state.saveIndicatorState} />
			</div>
		);
	}
}