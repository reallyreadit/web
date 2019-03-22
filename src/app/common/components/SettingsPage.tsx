import * as React from 'react';
import Separator from '../../../common/components/Separator';
import ActionLink from '../../../common/components/ActionLink';
import Icon from '../../../common/components/Icon';
import classNames from 'classnames';
import EditContactPreferencesDialog from './SettingsPage/EditContactPreferencesDialog';
import EditNotificationsDialog from './SettingsPage/EditNotificationsDialog';
import ChangePasswordDialog from './SettingsPage/ChangePasswordDialog';
import ChangeEmailAddressDialog from './SettingsPage/ChangeEmailAddressDialog';
import UserAccount from '../../../common/models/UserAccount';
import { Intent } from '../../../common/components/Toaster';
import { Screen, SharedState } from './Root';
import { FetchFunction } from '../serverApi/ServerApi';
import TimeZoneSelectListItem from '../../../common/models/TimeZoneSelectListItem';
import ChangeTimeZoneDialog from './SettingsPage/ChangeTimeZoneDialog';
import AsyncActionLink from './controls/AsyncActionLink';
import ScreenContainer from './ScreenContainer';

interface Props {
	onCloseDialog: () => void,
	onChangeEmailAddress: (email: string) => Promise<void>,
	onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>,
	onChangeTimeZone: (timeZone: { id: number }) => Promise<void>,
	onGetTimeZones: FetchFunction<TimeZoneSelectListItem[]>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onResendConfirmationEmail: () => Promise<void>,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onUpdateContactPreferences: (receiveWebsiteUpdates: boolean, receiveSuggestedReadings: boolean) => Promise<void>,
	onUpdateNotificationPreferences: (receiveEmailNotifications: boolean, receiveDesktopNotifications: boolean) => Promise<void>,
	user: UserAccount
}
class SettingsPage extends React.PureComponent<Props> {
	private _openChangePasswordDialog = () => {
		this.props.onOpenDialog(
			<ChangePasswordDialog
				onCloseDialog={this.props.onCloseDialog}
				onChangePassword={this.props.onChangePassword}
				onShowToast={this.props.onShowToast}
			/>
		);
	};
	private _openChangeEmailAddressDialog = () => {
		this.props.onOpenDialog(
			<ChangeEmailAddressDialog
				currentEmailAddress={this.props.user.email}
				onCloseDialog={this.props.onCloseDialog}
				onChangeEmailAddress={this.props.onChangeEmailAddress}
				onShowToast={this.props.onShowToast}
			/>
		);
	};
	private _openChangeTimeZoneDialog = () => {
		this.props.onOpenDialog(
			<ChangeTimeZoneDialog
				currentTimeZoneId={this.props.user.timeZoneId}
				onCloseDialog={this.props.onCloseDialog}
				onChangeTimeZone={this.props.onChangeTimeZone}
				onGetTimeZones={this.props.onGetTimeZones}
				onShowToast={this.props.onShowToast}
			/>
		);
	};
	private _openEditNotificationsDialog = () => {
		this.props.onOpenDialog(
			<EditNotificationsDialog
				onCloseDialog={this.props.onCloseDialog}
				onShowToast={this.props.onShowToast}
				onUpdateNotificationPreferences={this.props.onUpdateNotificationPreferences}
				receiveEmailNotifications={this.props.user.receiveReplyEmailNotifications}
				receiveDesktopNotifications={this.props.user.receiveReplyDesktopNotifications}
			/>
		);
	};
	private _openEditContactPreferencesDialog = () => {
		this.props.onOpenDialog(
			<EditContactPreferencesDialog
				onCloseDialog={this.props.onCloseDialog}
				onShowToast={this.props.onShowToast}
				onUpdateContactPreferences={this.props.onUpdateContactPreferences}
				receiveWebsiteUpdates={this.props.user.receiveWebsiteUpdates}
				receiveSuggestedReadings={this.props.user.receiveSuggestedReadings}
			/>
		);
	};
	public render() {
		const user = this.props.user;
		return (
			<ScreenContainer>
				<div className="settings-page_ejwkk">
					<ul>
						<li>
							<label>
								<strong>Username</strong>
								<Separator />
								<ActionLink text="Change Password" iconLeft="locked" onClick={this._openChangePasswordDialog} />
							</label>
							{user.name}
						</li>
						<li>
							<label>
								<strong>Email Address</strong>
								<Separator />
								<ActionLink text="Change" iconLeft="write" onClick={this._openChangeEmailAddressDialog} />
							</label>
							{user.email}
							{user.isEmailConfirmed ?
								<div className="setting on">
									<Icon name="checkmark" />
									Confirmed
								</div> :
								<div className="setting warn">
									<Icon name="exclamation" />
									Not Confirmed
									<Separator />
									<AsyncActionLink
										icon="email"
										onClick={this.props.onResendConfirmationEmail}
										text="Resend confirmation email"
									/>
								</div>}
						</li>
						<li>
							<label>
								<strong>Notifications</strong>
								<Separator />
								<ActionLink text="Edit" iconLeft="write" onClick={this._openEditNotificationsDialog} />
							</label>
							When someone replies to my comment:
							<div className={classNames('setting', user.receiveReplyEmailNotifications ? 'on' : 'off')}>
								<Icon name={user.receiveReplyEmailNotifications ? 'checkmark' : 'cancel'} />
								Send me an email
							</div>
							<div className={classNames('setting', user.receiveReplyDesktopNotifications ? 'on' : 'off')}>
								<Icon name={user.receiveReplyDesktopNotifications ? 'checkmark' : 'cancel'} />
								Show a desktop notification
							</div>
						</li>
						<li>
							<label>
								<strong>Contact Preferences</strong>
								<Separator />
								<ActionLink text="Edit" iconLeft="write" onClick={this._openEditContactPreferencesDialog} />
							</label>
							Feel free to occasionally email me about the following:
							<div className={classNames('setting', user.receiveWebsiteUpdates ? 'on' : 'off')}>
								<Icon name={user.receiveWebsiteUpdates ? 'checkmark' : 'cancel'} />
								Community updates
							</div>
							<div className={classNames('setting', user.receiveSuggestedReadings ? 'on' : 'off')}>
								<Icon name={user.receiveSuggestedReadings ? 'checkmark' : 'cancel'} />
								Suggested readings
							</div>
						</li>
						<li>
							<label>
								<strong>Time Zone</strong>
								<Separator />
								<ActionLink text="Change" iconLeft="write" onClick={this._openChangeTimeZoneDialog} />
							</label>
							{user.timeZoneDisplayName}
						</li>
					</ul>
				</div>
			</ScreenContainer>
		);
	}
}
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Pick<Props, Exclude<keyof Props, 'user'>>) {
	return {
		create: () => ({ key, title: 'Settings' }),
		render: (screenState: Screen, sharedState: SharedState) => (
			<SettingsPage
				onCloseDialog={deps.onCloseDialog}
				onChangeEmailAddress={deps.onChangeEmailAddress}
				onChangePassword={deps.onChangePassword}
				onChangeTimeZone={deps.onChangeTimeZone}
				onOpenDialog={deps.onOpenDialog}
				onGetTimeZones={deps.onGetTimeZones}
				onResendConfirmationEmail={deps.onResendConfirmationEmail}
				onShowToast={deps.onShowToast}
				onUpdateContactPreferences={deps.onUpdateContactPreferences}
				onUpdateNotificationPreferences={deps.onUpdateNotificationPreferences}
				user={sharedState.user}
			/>
		)
	};
}