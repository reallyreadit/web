import * as React from 'react';
import Dialog, { Props as DialogProps, State } from '../controls/Dialog';

interface Values {
	receiveEmailNotifications: boolean,
	receiveDesktopNotifications: boolean
}
interface Props extends Values {
	onUpdateNotificationPreferences: (receiveEmailNotifications: boolean, receiveDesktopNotifications: boolean) => Promise<void>
}
export default class extends Dialog<void, Props, Partial<State> & Values> {
	private _handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ receiveEmailNotifications: e.currentTarget.checked });
	private _handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ receiveDesktopNotifications: e.currentTarget.checked });
	constructor(props: Props & DialogProps) {
		super(
			{
				title: 'Edit Notifications',
				submitButtonText: 'Save Changes',
				successMessage: 'Notification preferences updated'
			},
			props
		);
		this.state = {
			...this.state,
			receiveEmailNotifications: props.receiveEmailNotifications,
			receiveDesktopNotifications: props.receiveDesktopNotifications
		};
	}
	protected renderFields() {
		return (
			<div className="edit-notifications-dialog_7jh2m">
				When someone replies to my comment:
				<ul>
					<li>
						<label>
							<input type="checkbox" checked={this.state.receiveEmailNotifications} onChange={this._handleEmailChange} />
							<span>Send me an email</span>
						</label>
					</li>
					<li>
						<label>
							<input type="checkbox" checked={this.state.receiveDesktopNotifications} onChange={this._handleDesktopChange} />
							<span>Show a desktop notification</span>
						</label>
					</li>
				</ul>
			</div>
		);
	}
	protected submitForm() {
		return this.props.onUpdateNotificationPreferences(this.state.receiveEmailNotifications, this.state.receiveDesktopNotifications);
	}
}