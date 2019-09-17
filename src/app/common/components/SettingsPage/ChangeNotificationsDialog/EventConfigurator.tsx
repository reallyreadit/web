import * as React from 'react';
import NotificationChannel from '../../../../../common/models/notifications/NotificationChannel';

export interface Configuration {
	alert: NotificationChannel,
	dailyDigest: NotificationChannel,
	weeklyDigest: NotificationChannel
}
interface Props {
	label: string,
	onChange: (value: Configuration) => void,
	options: Partial<Configuration>,
	value: Configuration
}
enum Mode {
	Disabled = 'Disabled',
	Alerts = 'Alerts',
	DailyDigest = 'Daily Digest',
	WeeklyDigest = 'Weekly Digest'
}
function setChannelCheckboxValue(currentValue: NotificationChannel, checkboxValue: NotificationChannel, isChecked: boolean) {
	return (
		isChecked ?
			currentValue | checkboxValue :
			currentValue ^ checkboxValue
	);
}
export default class EventConfigurator extends React.PureComponent<
	Props,
	{ mode: Mode }
> {
	private readonly _changeChannel = (event: React.ChangeEvent<HTMLInputElement>) => {
		let channel: NotificationChannel;
		switch (event.target.name) {
			case 'Email':
				channel = NotificationChannel.Email;
				break;
			case 'Extension':
				channel = NotificationChannel.Extension;
				break;
			case 'Push':
				channel = NotificationChannel.Push;
				break;
		}
		const value = {
			alert: NotificationChannel.None,
			dailyDigest: NotificationChannel.None,
			weeklyDigest: NotificationChannel.None
		};
		switch (this.state.mode) {
			case Mode.Alerts:
				value.alert = setChannelCheckboxValue(this.props.value.alert, channel, event.target.checked);
				break;
			case Mode.DailyDigest:
				value.dailyDigest = setChannelCheckboxValue(this.props.value.dailyDigest, channel, event.target.checked);
				break;
			case Mode.WeeklyDigest:
				value.weeklyDigest = setChannelCheckboxValue(this.props.value.weeklyDigest, channel, event.target.checked);
				break;
		}
		this.props.onChange(value);
	};
	private readonly _changeMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
		this.setState(
			{ mode: event.target.value as Mode },
			() => {
				const value = {
					alert: NotificationChannel.None,
					dailyDigest: NotificationChannel.None,
					weeklyDigest: NotificationChannel.None
				};
				switch (this.state.mode) {
					case Mode.Alerts:
						value.alert = this.props.options.alert;
						break;
					case Mode.DailyDigest:
						value.dailyDigest = this.props.options.dailyDigest;
						break;
					case Mode.WeeklyDigest:
						value.weeklyDigest = this.props.options.weeklyDigest;
						break;
				}
				this.props.onChange(value);
			}
		);
	};
	constructor(props: Props) {
		super(props);
		let mode = Mode.Disabled;
		if (props.value.alert) {
			mode = Mode.Alerts;
		} else if (props.value.dailyDigest) {
			mode = Mode.DailyDigest;
		} else if (props.value.weeklyDigest) {
			mode = Mode.WeeklyDigest;
		}
		this.state = { mode };
	}
	public render() {
		const modes = [Mode.Disabled];
		if (this.props.options.alert) {
			modes.push(Mode.Alerts);
		}
		if (this.props.options.dailyDigest) {
			modes.push(Mode.DailyDigest);
		}
		if (this.props.options.weeklyDigest) {
			modes.push(Mode.WeeklyDigest);
		}
		let
			channelOptions: NotificationChannel,
			channelValue: NotificationChannel;
		switch (this.state.mode) {
			case Mode.Disabled:
				channelOptions = NotificationChannel.None;
				channelValue = NotificationChannel.None;
				break;
			case Mode.Alerts:
				channelOptions = this.props.options.alert;
				channelValue = this.props.value.alert;
				break;
			case Mode.DailyDigest:
				channelOptions = this.props.options.dailyDigest;
				channelValue = this.props.value.dailyDigest;
				break;
			case Mode.WeeklyDigest:
				channelOptions = this.props.options.weeklyDigest;
				channelValue = this.props.value.weeklyDigest;
				break;
		}
		return (
			<div className="event-configurator_nibmbx">
				<div className="label">{this.props.label}</div>
				<select
					onChange={this._changeMode}
					value={this.state.mode}
				>
					{modes.map(
						mode => (
							<option key={mode}>
								{mode}
							</option>
						)
					)}
				</select>
				{channelOptions !== NotificationChannel.None ?
					<div className="checkboxes">
						{channelOptions & NotificationChannel.Email ?
							<label>
								<input
									checked={!!(channelValue & NotificationChannel.Email)}
									onChange={this._changeChannel}
									name="Email"
									type="checkbox"
								/>
								Email
							</label> :
							null}
						{channelOptions & NotificationChannel.Extension ?
							<label>
								<input
									checked={!!(channelValue & NotificationChannel.Extension)}
									onChange={this._changeChannel}
									name="Extension"
									type="checkbox"
								/>
								Extension
							</label> :
							null}
						{channelOptions & NotificationChannel.Push ?
							<label>
								<input
									checked={!!(channelValue & NotificationChannel.Push)}
									onChange={this._changeChannel}
									name="Push"
									type="checkbox"
								/>
								Push
							</label> :
							null}
					</div> :
					null}
			</div>
		);
	}
}