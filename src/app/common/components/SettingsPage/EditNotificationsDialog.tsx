import * as React from 'react';
import Dialog, { State } from '../Dialog';
import Context from '../../Context';
import UserAccount from '../../../../common/models/UserAccount';

interface Values {
	receiveEmailNotifications: boolean,
	receiveDesktopNotifications: boolean
}
interface Props extends Values {
	onSuccess: (userAccount: UserAccount) => void
}
export default class EditNotificationsDialog extends Dialog<UserAccount, Props, Partial<State> & Values> {
	private _handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ receiveEmailNotifications: e.currentTarget.checked });
	private _handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ receiveDesktopNotifications: e.currentTarget.checked });
	constructor(props: Props, context: Context) {
		super(
			{
				title: 'Edit Notifications',
				submitButtonText: 'Save Changes'
			},
			props,
			context
		);
		this.state = {
			...this.state,
			receiveEmailNotifications: props.receiveEmailNotifications,
			receiveDesktopNotifications: props.receiveDesktopNotifications
		};
	}
	protected renderFields() {
		return (
			<div className="edit-notifications-dialog">
				When someone replies to my comment
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
		return this.context.api.updateNotificationPreferences(this.state.receiveEmailNotifications, this.state.receiveDesktopNotifications);
	}
	protected onSuccess(userAccount: UserAccount) {
		this.props.onSuccess(userAccount);
	}
}