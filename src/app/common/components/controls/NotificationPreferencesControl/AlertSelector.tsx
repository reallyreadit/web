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
import AlertEmailPreference from '../../../../../common/models/notifications/AlertEmailPreference';
import AsyncTracker from '../../../../../common/AsyncTracker';
import { State as SaveIndicatorState } from '../../../../../common/components/SaveIndicator';
import ToggleSwitchExpandableInput from '../../../../../common/components/ToggleSwitchExpandableInput';
import SelectList, {
	SelectListOption,
} from '../../../../../common/components/SelectList';

export interface Value {
	isEnabled: boolean;
	email?: AlertEmailPreference;
	extension?: boolean;
	push?: boolean;
}
interface Props extends Value {
	title: string;
	subtitle?: string;
	emailOptions?: AlertEmailPreference;
	showChannels?: boolean;
	onChange: (value: Partial<Value>) => Promise<any>;
}
interface State {
	indicator: SaveIndicatorState;
}
export default class AlertSelector extends React.PureComponent<Props, State> {
	public static defaultProps: Pick<Props, 'showChannels'> = {
		showChannels: true,
	};
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _selectEmail = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		this.saveChanges({
			email: parseInt(event.currentTarget.value) as AlertEmailPreference,
		});
	};
	private readonly _togglePush = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		this.saveChanges({
			push: event.currentTarget.checked,
		});
	};
	private readonly _toggleEmail = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		this.saveChanges({
			email: event.currentTarget.checked
				? AlertEmailPreference.Immediately
				: AlertEmailPreference.None,
		});
	};
	private readonly _toggleEnabled = (isEnabled: boolean) => {
		let value: Value;
		if (isEnabled) {
			value = {
				isEnabled,
				email: AlertEmailPreference.Immediately,
				extension: true,
				push: true,
			};
		} else {
			value = {
				isEnabled,
				email: AlertEmailPreference.None,
				extension: false,
				push: false,
			};
		}
		this.saveChanges(value);
	};
	private readonly _toggleExtension = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		this.saveChanges({
			extension: event.currentTarget.checked,
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			indicator: SaveIndicatorState.None,
		};
	}
	private saveChanges(value: Partial<Value>) {
		this.setState({ indicator: SaveIndicatorState.Saving });
		this._asyncTracker.addPromise(this.props.onChange(value)).then(() => {
			this.setState({ indicator: SaveIndicatorState.Saved });
		});
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		let emailSelectList: React.ReactNode;
		if (this.props.email !== AlertEmailPreference.None) {
			const options: SelectListOption[] = [];
			if (
				!this.props.emailOptions ||
				this.props.emailOptions & AlertEmailPreference.Immediately
			) {
				options.push({
					key: 'Immediately',
					value: AlertEmailPreference.Immediately,
				});
			}
			if (
				!this.props.emailOptions ||
				this.props.emailOptions & AlertEmailPreference.DailyDigest
			) {
				options.push({
					key: 'Daily Digest',
					value: AlertEmailPreference.DailyDigest,
				});
			}
			if (
				!this.props.emailOptions ||
				this.props.emailOptions & AlertEmailPreference.WeeklyDigest
			) {
				options.push({
					key: 'Weekly Digest',
					value: AlertEmailPreference.WeeklyDigest,
				});
			}
			emailSelectList = (
				<SelectList
					onChange={this._selectEmail}
					options={options}
					value={this.props.email}
				/>
			);
		}
		return (
			<ToggleSwitchExpandableInput
				className="alert-selector_esabj4"
				isEnabled={this.props.isEnabled}
				onChange={this._toggleEnabled}
				saveIndicator={this.state.indicator}
				subtitle={this.props.subtitle}
				title={this.props.title}
			>
				{this.props.isEnabled && this.props.showChannels ? (
					<ol>
						<li>
							<label>
								<input
									type="checkbox"
									checked={this.props.email !== AlertEmailPreference.None}
									onChange={this._toggleEmail}
								/>
								<span>Email</span>
							</label>
							{emailSelectList}
						</li>
						<li>
							<label>
								<input
									type="checkbox"
									checked={this.props.extension}
									onChange={this._toggleExtension}
								/>
								<span>Desktop</span>
							</label>
						</li>
						<li>
							<label>
								<input
									type="checkbox"
									checked={this.props.push}
									onChange={this._togglePush}
								/>
								<span>iOS</span>
							</label>
						</li>
					</ol>
				) : null}
			</ToggleSwitchExpandableInput>
		);
	}
}
