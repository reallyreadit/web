import * as React from 'react';
import Dialog, { DialogState } from '../Dialog';
import Context from '../../Context';
import CancelablePromise from '../../CancelablePromise';
import UserAccount from '../../api/models/UserAccount';

interface Values {
	receiveEmailNotifications: boolean,
	receiveDesktopNotifications: boolean
}
interface Props extends Values {
	onSuccess: (userAccount: UserAccount) => void
}
export default class EditNotificationsDialog extends Dialog<Props, Partial<DialogState> & Values> {
	protected title = 'Edit Notifications';
	protected className = 'edit-notifications-dialog';
	protected submitButtonText = 'Save Changes';
	private _handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ receiveEmailNotifications: e.currentTarget.checked });
	private _handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ receiveDesktopNotifications: e.currentTarget.checked });
	constructor(props: Props, context: Context) {
		super(props, props, context);
	}
	protected onSubmit() {
		return new CancelablePromise(this.context.api
			.updateNotificationPreferences(this.state.receiveEmailNotifications, this.state.receiveDesktopNotifications)
			.then(userAccount => {
				this.props.onSuccess(userAccount);
				this.context.page.closeDialog();
			}));
	}
	protected validate() {
		return true;
	}
	protected renderFields() {
		return (
			<div className="fields">
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
}