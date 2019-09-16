import * as React from 'react';
import FormDialog, { Props as FormDialogProps, State } from '../controls/FormDialog';
import NotificationPreference from '../../../../common/models/notifications/NotificationPreference';
import EventConfigurator, { Configuration as ConfiguratorValue } from './ChangeNotificationsDialog/EventConfigurator';
import NotificationChannel from '../../../../common/models/notifications/NotificationChannel';
import NotificationEventFrequency from '../../../../common/models/notifications/NotificationEventFrequency';

interface Props {
	onChangeNotificationPreference: (preference: NotificationPreference) => Promise<NotificationPreference>,
	preference: NotificationPreference
}
export default class ChangeNotificationPreferenceDialog extends FormDialog<NotificationPreference, Props, Partial<State> & {
	preference: NotificationPreference
}> {
	private readonly _changeCompanyUpdatePreference = (value: ConfiguratorValue) => {
		this.setState({
			preference: {
				...this.state.preference,
				companyUpdate: value.alert
			}
		});
	};
	private readonly _changeSuggestedReadingPreference = (value: ConfiguratorValue) => {
		this.setState({
			preference: {
				...this.state.preference,
				suggestedReading: value.weeklyDigest ?
					NotificationEventFrequency.Weekly :
					NotificationEventFrequency.Never
				}
		});
	};
	private readonly _changeAotdPreference = (value: ConfiguratorValue) => {
		this.setState({
			preference: {
				...this.state.preference,
				aotd: value.alert
			}
		});
	};
	private readonly _changeReplyPreference = (value: ConfiguratorValue) => {
		this.setState({
			preference: {
				...this.state.preference,
				reply: value.alert,
				replyDigest: value.dailyDigest ?
					NotificationEventFrequency.Daily :
					value.weeklyDigest ?
						NotificationEventFrequency.Weekly :
						NotificationEventFrequency.Never
			}
		});
	};
	private readonly _changeLoopbackPreference = (value: ConfiguratorValue) => {
		this.setState({
			preference: {
				...this.state.preference,
				loopback: value.alert,
				loopbackDigest: value.dailyDigest ?
					NotificationEventFrequency.Daily :
					value.weeklyDigest ?
						NotificationEventFrequency.Weekly :
						NotificationEventFrequency.Never
			}
		});
	};
	private readonly _changePostPreference = (value: ConfiguratorValue) => {
		this.setState({
			preference: {
				...this.state.preference,
				post: value.alert,
				postDigest: value.dailyDigest ?
					NotificationEventFrequency.Daily :
					value.weeklyDigest ?
						NotificationEventFrequency.Weekly :
						NotificationEventFrequency.Never
			}
		});
	};
	private readonly _changeFollowerPreference = (value: ConfiguratorValue) => {
		this.setState({
			preference: {
				...this.state.preference,
				follower: value.alert,
				followerDigest: value.dailyDigest ?
					NotificationEventFrequency.Daily :
					value.weeklyDigest ?
						NotificationEventFrequency.Weekly :
						NotificationEventFrequency.Never
			}
		});
	};
	constructor(props: Props & FormDialogProps) {
		super(
			{
				className: 'change-notifications-dialog_r5angh',
				title: 'Change Notifications',
				submitButtonText: 'Save Changes',
				successMessage: 'Notifications changed'
			},
			props
		);
		this.state = {
			...this.state,
			preference: props.preference
		};
	}
	protected renderFields() {
		return (
			<>
				<EventConfigurator
					label="Company Update"
					onChange={this._changeCompanyUpdatePreference}
					options={{
						alert: NotificationChannel.Email
					}}
					value={{
						alert: this.state.preference.companyUpdate,
						dailyDigest: NotificationChannel.None,
						weeklyDigest: NotificationChannel.None
					}}
				/>
				<EventConfigurator
					label="Suggested Reading"
					onChange={this._changeSuggestedReadingPreference}
					options={{
						weeklyDigest: NotificationChannel.Email
					}}
					value={{
						alert: NotificationChannel.None,
						dailyDigest: NotificationChannel.None,
						weeklyDigest: this.state.preference.suggestedReading & NotificationEventFrequency.Weekly ?
							NotificationChannel.Email :
							NotificationChannel.None
					}}
				/>
				<EventConfigurator
					label="Article of the Day"
					onChange={this._changeAotdPreference}
					options={{
						alert: NotificationChannel.Email | NotificationChannel.Extension | NotificationChannel.Push
					}}
					value={{
						alert: this.state.preference.aotd,
						dailyDigest: NotificationChannel.None,
						weeklyDigest: NotificationChannel.None
					}}
				/>
				<EventConfigurator
					label="Reply"
					onChange={this._changeReplyPreference}
					options={{
						alert: NotificationChannel.Email | NotificationChannel.Extension | NotificationChannel.Push,
						dailyDigest: NotificationChannel.Email,
						weeklyDigest: NotificationChannel.Email
					}}
					value={{
						alert: this.state.preference.reply,
						dailyDigest: this.state.preference.replyDigest & NotificationEventFrequency.Daily ?
							NotificationChannel.Email :
							NotificationChannel.None,
						weeklyDigest: this.state.preference.replyDigest & NotificationEventFrequency.Weekly ?
							NotificationChannel.Email :
							NotificationChannel.None
					}}
				/>
				<EventConfigurator
					label="Loopback"
					onChange={this._changeLoopbackPreference}
					options={{
						alert: NotificationChannel.Email | NotificationChannel.Extension | NotificationChannel.Push,
						dailyDigest: NotificationChannel.Email,
						weeklyDigest: NotificationChannel.Email
					}}
					value={{
						alert: this.state.preference.loopback,
						dailyDigest: this.state.preference.loopbackDigest & NotificationEventFrequency.Daily ?
							NotificationChannel.Email :
							NotificationChannel.None,
						weeklyDigest: this.state.preference.loopbackDigest & NotificationEventFrequency.Weekly ?
							NotificationChannel.Email :
							NotificationChannel.None
					}}
				/>
				<EventConfigurator
					label="Post"
					onChange={this._changePostPreference}
					options={{
						alert: NotificationChannel.Email | NotificationChannel.Extension | NotificationChannel.Push,
						dailyDigest: NotificationChannel.Email,
						weeklyDigest: NotificationChannel.Email
					}}
					value={{
						alert: this.state.preference.post,
						dailyDigest: this.state.preference.postDigest & NotificationEventFrequency.Daily ?
							NotificationChannel.Email :
							NotificationChannel.None,
						weeklyDigest: this.state.preference.postDigest & NotificationEventFrequency.Weekly ?
							NotificationChannel.Email :
							NotificationChannel.None
					}}
				/>
				<EventConfigurator
					label="Follower"
					onChange={this._changeFollowerPreference}
					options={{
						alert: NotificationChannel.Email | NotificationChannel.Extension | NotificationChannel.Push,
						dailyDigest: NotificationChannel.Email,
						weeklyDigest: NotificationChannel.Email
					}}
					value={{
						alert: this.state.preference.follower,
						dailyDigest: this.state.preference.followerDigest & NotificationEventFrequency.Daily ?
							NotificationChannel.Email :
							NotificationChannel.None,
						weeklyDigest: this.state.preference.followerDigest & NotificationEventFrequency.Weekly ?
							NotificationChannel.Email :
							NotificationChannel.None
					}}
				/>
			</>
		);
	}
	protected submitForm() {
		return this.props.onChangeNotificationPreference(this.state.preference);
	}
}