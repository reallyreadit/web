import * as React from 'react';
import Separator from '../../../common/components/Separator';
import ActionLink from '../../../common/components/ActionLink';
import Icon from '../../../common/components/Icon';
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
import RouteLocation from '../../../common/routing/RouteLocation';
import Fetchable from '../../../common/Fetchable';
import AsyncTracker from '../../../common/AsyncTracker';
import Settings from '../../../common/models/Settings';
import LoadingOverlay from './controls/LoadingOverlay';
import NotificationPreference from '../../../common/models/notifications/NotificationPreference';
import NotificationPreferencesControl from './controls/NotificationPreferencesControl';

interface Props {
	onCloseDialog: () => void,
	onChangeEmailAddress: (email: string) => Promise<void>,
	onChangeNotificationPreference: (data: NotificationPreference) => Promise<NotificationPreference>,
	onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>,
	onChangeTimeZone: (timeZone: { id: number }) => Promise<void>,
	onGetSettings: FetchFunction<Settings>,
	onGetTimeZones: FetchFunction<TimeZoneSelectListItem[]>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onRegisterNotificationPreferenceChangedEventHandler: (handler: (preference: NotificationPreference) => void) => () => void,
	onResendConfirmationEmail: () => Promise<void>,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	user: UserAccount
}
class SettingsPage extends React.PureComponent<
	Props,
	{
		settings: Fetchable<Settings>
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeTimeZone = (id: number, timeZoneDisplayName: string) => {
		return this.props
			.onChangeTimeZone({ id })
			.then(
				() => {
					this.setState({
						settings: {
							...this.state.settings,
							value: {
								...this.state.settings.value,
								timeZoneDisplayName
							}
						}
					});
				}
			);
	};
	private readonly _openChangePasswordDialog = () => {
		this.props.onOpenDialog(
			<ChangePasswordDialog
				onCloseDialog={this.props.onCloseDialog}
				onChangePassword={this.props.onChangePassword}
				onShowToast={this.props.onShowToast}
			/>
		);
	};
	private readonly _openChangeEmailAddressDialog = () => {
		this.props.onOpenDialog(
			<ChangeEmailAddressDialog
				currentEmailAddress={this.props.user.email}
				onCloseDialog={this.props.onCloseDialog}
				onChangeEmailAddress={this.props.onChangeEmailAddress}
				onShowToast={this.props.onShowToast}
			/>
		);
	};
	private readonly _openChangeTimeZoneDialog = () => {
		this.props.onOpenDialog(
			<ChangeTimeZoneDialog
				currentTimeZoneId={this.props.user.timeZoneId}
				onCloseDialog={this.props.onCloseDialog}
				onChangeTimeZone={this._changeTimeZone}
				onGetTimeZones={this.props.onGetTimeZones}
				onShowToast={this.props.onShowToast}
			/>
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			settings: props.onGetSettings(
				this._asyncTracker.addCallback(
					settings => {
						this.setState({ settings });
					}
				)
			)
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterNotificationPreferenceChangedEventHandler(
				notificationPreference => {
					this.setState({
						settings: {
							...this.state.settings,
							value: {
								...this.state.settings.value,
								notificationPreference
							}
						}
					});
				}
			)
		);
	}
	public componentDidUpdate(prevProps: Props) {
		if (this.props.user.timeZoneId !== prevProps.user.timeZoneId) {
			this.props.onGetSettings(
				this._asyncTracker.addCallback(
					settings => {
						this.setState({ settings });
					}
				)
			);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const user = this.props.user;
		return (
			<ScreenContainer className="settings-page_ejwkk">
				{this.state.settings.isLoading ?
					<LoadingOverlay position="absolute" /> :
					<>
						<div className="setting">
							<div className="header">
								<span className="label">Username</span>
								<Separator />
								<ActionLink text="Change Password" iconLeft="locked" onClick={this._openChangePasswordDialog} />
							</div>
							<div className="section">
								{user.name}
								<br />
								<small>(Account # {this.props.user.id} of {this.state.settings.value.userCount}.)</small>
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Email Address</span>
								<Separator />
								<ActionLink text="Change" iconLeft="write" onClick={this._openChangeEmailAddressDialog} />
							</div>
							<div className="section">
								{user.email}
								<div className="indicators">
									{user.isEmailConfirmed ?
										<div className="status on">
											<Icon name="checkmark" />
											Confirmed
										</div> :
										<div className="status warn">
											<Icon name="exclamation" />
											Not Confirmed
											<Separator />
											<AsyncActionLink
												icon="email"
												onClick={this.props.onResendConfirmationEmail}
												text="Resend confirmation email"
											/>
										</div>}
								</div>
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Notifications</span>
							</div>
							<div className="section">
								<NotificationPreferencesControl
									preference={this.state.settings.value.notificationPreference}
									onChangeNotificationPreference={this.props.onChangeNotificationPreference}
								/>
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Time Zone</span>
								<Separator />
								<ActionLink text="Change" iconLeft="write" onClick={this._openChangeTimeZoneDialog} />
							</div>
							<div className="section">
								{this.state.settings.value.timeZoneDisplayName}
							</div>
						</div>
					</>}
			</ScreenContainer>
		);
	}
}
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Pick<Props, Exclude<keyof Props, 'user'>>) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Settings' }),
		render: (screenState: Screen, sharedState: SharedState) => (
			<SettingsPage
				onCloseDialog={deps.onCloseDialog}
				onChangeEmailAddress={deps.onChangeEmailAddress}
				onChangeNotificationPreference={deps.onChangeNotificationPreference}
				onChangePassword={deps.onChangePassword}
				onChangeTimeZone={deps.onChangeTimeZone}
				onOpenDialog={deps.onOpenDialog}
				onGetSettings={deps.onGetSettings}
				onGetTimeZones={deps.onGetTimeZones}
				onRegisterNotificationPreferenceChangedEventHandler={deps.onRegisterNotificationPreferenceChangedEventHandler}
				onResendConfirmationEmail={deps.onResendConfirmationEmail}
				onShowToast={deps.onShowToast}
				user={sharedState.user}
			/>
		)
	};
}