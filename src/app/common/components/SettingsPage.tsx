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
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import SetPasswordDialog from './SettingsPage/SetPasswordDialog';
import { DateTime } from 'luxon';
import { formatIsoDateAsUtc } from '../../../common/format';
import LinkAccountDialog from './SettingsPage/LinkAccountDialog';
import AuthServiceAccountAssociation from '../../../common/models/auth/AuthServiceAccountAssociation';
import ContentBox from '../../../common/components/ContentBox';

interface Props {
	onCloseDialog: () => void,
	onChangeEmailAddress: (email: string) => Promise<void>,
	onChangeNotificationPreference: (data: NotificationPreference) => Promise<NotificationPreference>,
	onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>,
	onChangeTimeZone: (timeZone: { id: number }) => Promise<void>,
	onLinkAuthServiceAccount: (provider: AuthServiceProvider) => Promise<AuthServiceAccountAssociation>,
	onGetSettings: FetchFunction<Settings>,
	onGetTimeZones: FetchFunction<TimeZoneSelectListItem[]>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onRegisterNotificationPreferenceChangedEventHandler: (handler: (preference: NotificationPreference) => void) => () => void,
	onResendConfirmationEmail: () => Promise<void>,
	onSendPasswordCreationEmail: () => Promise<void>,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	user: UserAccount
}
class SettingsPage extends React.PureComponent<
	Props,
	{
		highlightedAuthServiceAccountId: number,
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
	private readonly _linkAuthServiceAccount = (provider: AuthServiceProvider) => {
		return this.props
			.onLinkAuthServiceAccount(provider)
			.then(
				association => {
					this._mergeAuthServiceAccount(association);
					return association;
				}
			);
	};
	private readonly _mergeAuthServiceAccount = (account: AuthServiceAccountAssociation) => {
		const
			authServiceAccounts = this.state.settings.value.authServiceAccounts.slice(),
			existingAccountIndex = authServiceAccounts.findIndex(
				existingAccount => existingAccount.identityId === account.identityId
			);
		if (existingAccountIndex !== -1) {
			authServiceAccounts.splice(existingAccountIndex, 1, account);
		} else {
			authServiceAccounts.unshift(account);
		}
		this.setState({
			highlightedAuthServiceAccountId: (
				existingAccountIndex === -1 ?
					account.identityId :
					this.state.highlightedAuthServiceAccountId
			),
			settings: {
				...this.state.settings,
				value: {
					...this.state.settings.value,
					authServiceAccounts
				}
			}
		});
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
	private readonly _openLinkAccountDialog = () => {
		this.props.onOpenDialog(
			<LinkAccountDialog
				onCloseDialog={this.props.onCloseDialog}
				onLinkAuthServiceAccount={this._linkAuthServiceAccount}
				onShowToast={this.props.onShowToast}
			/>
		);
	};
	private readonly _openSetPasswordDialog = () => {
		this.props.onOpenDialog(
			<SetPasswordDialog
				email={this.props.user.email}
				onCloseDialog={this.props.onCloseDialog}
				onSendPasswordCreationEmail={this.props.onSendPasswordCreationEmail}
				onShowToast={this.props.onShowToast}
			/>
		)
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			highlightedAuthServiceAccountId: 0,
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
								{user.isPasswordSet ?
									<ActionLink text="Change Password" iconLeft="locked" onClick={this._openChangePasswordDialog} /> :
									<ActionLink
										iconLeft="locked"
										onClick={this._openSetPasswordDialog}
										text="Set Password"
									/>}
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
						<div className="setting accounts">
							<div className="header">
								<span className="label">Linked Accounts</span>
								<Separator />
								<ActionLink text="Add" iconLeft="plus" onClick={this._openLinkAccountDialog} />
							</div>
							<div className="section">
								{this.state.settings.value.authServiceAccounts.length ?
									this.state.settings.value.authServiceAccounts.map(
										account => {
											let
												identity: string,
												provider: string;
											switch (account.provider) {
												case AuthServiceProvider.Apple:
													provider = 'Apple';
													identity = account.emailAddress;
													break;
												case AuthServiceProvider.Twitter:
													provider = 'Twitter';
													identity = '@' + account.handle;
													break;
											}
											return (
												<ContentBox
													className="account"
													highlight={account.identityId === this.state.highlightedAuthServiceAccountId}
													key={account.identityId}
												>
													<div className="provider">{provider}</div>
													<div className="date">Added on {DateTime.fromISO(formatIsoDateAsUtc(account.dateAssociated)).toLocaleString(DateTime.DATE_MED)}</div>
													<div className="identity">{identity}</div>
												</ContentBox>
											);
										}
									) :
									'No linked accounts found.'}
							</div>
						</div>
					</>}
			</ScreenContainer>
		);
	}
}
export default function createSettingsScreenFactory<TScreenKey>(key: TScreenKey, deps: Pick<Props, Exclude<keyof Props, 'user'>>) {
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
				onLinkAuthServiceAccount={deps.onLinkAuthServiceAccount}
				onResendConfirmationEmail={deps.onResendConfirmationEmail}
				onSendPasswordCreationEmail={deps.onSendPasswordCreationEmail}
				onShowToast={deps.onShowToast}
				user={sharedState.user}
			/>
		)
	};
}