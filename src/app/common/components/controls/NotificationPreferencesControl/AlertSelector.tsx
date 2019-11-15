import * as React from 'react';
import ToggleSwitch from '../../../../../common/components/ToggleSwitch';
import AlertEmailPreference from '../../../../../common/models/notifications/AlertEmailPreference';
import AsyncTracker from '../../../../../common/AsyncTracker';
import SaveIndicator, { State as SaveIndicatorState } from '../../../../../common/components/SaveIndicator';

export interface Value {
	isEnabled: boolean,
	email?: AlertEmailPreference,
	extension?: boolean,
	push?: boolean
}
interface Props extends Value {
	title: string,
	subtitle?: string,
	emailOptions?: AlertEmailPreference,
	showChannels?: boolean,
	onChange: (value: Partial<Value>) => Promise<any>
}
interface State {
	indicator: SaveIndicatorState
}
export default class AlertSelector extends React.PureComponent<Props, State> {
	public static defaultProps: Partial<Props> = {
		showChannels: true
	};
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _selectEmail = (event: React.ChangeEvent<HTMLSelectElement>) => {
		this.saveChanges({
			email: parseInt(event.currentTarget.value) as AlertEmailPreference
		});
	};
	private readonly _togglePush = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.saveChanges({
			push: event.currentTarget.checked
		});
	};
	private readonly _toggleEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.saveChanges({
			email: event.currentTarget.checked ?
				AlertEmailPreference.Immediately :
				AlertEmailPreference.None
		});
	};
	private readonly _toggleEnabled = () => {
		let value: Value;
		if (this.props.isEnabled) {
			value = {
				isEnabled: false,
				email: AlertEmailPreference.None,
				extension: false,
				push: false
			};
		} else {
			value = {
				isEnabled: true,
				email: AlertEmailPreference.Immediately,
				extension: true,
				push: true
			};
		}
		this.saveChanges(value);
	};
	private readonly _toggleExtension = (event: React.ChangeEvent<HTMLInputElement>) => {
		this.saveChanges({
			extension: event.currentTarget.checked
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			indicator: SaveIndicatorState.None
		};
	}
	private saveChanges(value: Partial<Value>) {
		this.setState({ indicator: SaveIndicatorState.Saving });
		this._asyncTracker.addPromise(
			this.props
				.onChange(value)
				.then(
					() => {
						this.setState({ indicator: SaveIndicatorState.Saved });
					}
				)
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className="alert-selector_esabj4">
				<div className="switch-container">
					<ToggleSwitch
						isChecked={this.props.isEnabled}
						onChange={this._toggleEnabled}
					/>
				</div>
				<div className="controls">
					<div className="header">
						<label onClick={this._toggleEnabled}>{this.props.title}</label>
						{this.props.subtitle ?
							<span>{this.props.subtitle}</span> :
							null}
						<SaveIndicator state={this.state.indicator} />
					</div>
					{this.props.isEnabled && this.props.showChannels ?
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
								{this.props.email !== AlertEmailPreference.None ?
									<select
										value={this.props.email}
										onChange={this._selectEmail}
									>
										{!this.props.emailOptions || this.props.emailOptions & AlertEmailPreference.Immediately ?
											<option value={AlertEmailPreference.Immediately}>Immediately</option> :
											null}
										{!this.props.emailOptions || this.props.emailOptions & AlertEmailPreference.DailyDigest ?
											<option value={AlertEmailPreference.DailyDigest}>Daily Digest</option> :
											null}
										{!this.props.emailOptions || this.props.emailOptions & AlertEmailPreference.WeeklyDigest ?
											<option value={AlertEmailPreference.WeeklyDigest}>Weekly Digest</option> :
											null}
									</select> :
									null}
							</li>
							<li>
								<label>
									<input
										type="checkbox"
										checked={this.props.extension}
										onChange={this._toggleExtension}
									/>
									<span>Chrome</span>
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
						</ol> :
						null}
				</div>
			</div>
		);
	}
}