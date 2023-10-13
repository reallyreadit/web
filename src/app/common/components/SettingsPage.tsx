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
import Separator from '../../../common/components/Separator';
import Link from '../../../common/components/Link';
import Icon from '../../../common/components/Icon';
import ChangePasswordDialog from './SettingsPage/ChangePasswordDialog';
import ChangeEmailAddressDialog from './SettingsPage/ChangeEmailAddressDialog';
import UserAccount from '../../../common/models/UserAccount';
import { Intent } from '../../../common/components/Toaster';
import { NavOptions, NavReference, Screen, SharedState } from './Root';
import { FetchFunction } from '../serverApi/ServerApi';
import TimeZoneSelectListItem from '../../../common/models/TimeZoneSelectListItem';
import ChangeTimeZoneDialog from './SettingsPage/ChangeTimeZoneDialog';
import AsyncLink from './controls/AsyncLink';
import RouteLocation from '../../../common/routing/RouteLocation';
import Fetchable from '../../../common/Fetchable';
import AsyncTracker, { CancellationToken } from '../../../common/AsyncTracker';
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
import DisplayPreferencesControl from './SettingsPage/DisplayPreferencesControl';
import DisplayPreference, {
	DisplayTheme,
} from '../../../common/models/userAccounts/DisplayPreference';
import Button from '../../../common/components/Button';
import { findRouteByKey } from '../../../common/routing/Route';
import routes from '../../../common/routing/routes';
import ScreenKey from '../../../common/routing/ScreenKey';
import { AccountDeletionDialog } from './SettingsPage/AccountDeletionDialog';
import { WriterAccountControl } from './SettingsPage/WriterAccountControl';
import { AuthorEmailVerificationRequest } from '../../../common/models/userAccounts/AuthorEmailVerificationRequest';
import { TweetWebIntentParams } from '../../../common/sharing/twitter';
import SettingsLink from './SettingsPage/SettingsLink';
import UserAccountRole from '../../../common/models/UserAccountRole';

interface Props {
	displayTheme: DisplayTheme | null;
	onCloseDialog: () => void;
	onChangeDisplayPreference: (
		preference: DisplayPreference
	) => Promise<DisplayPreference>;
	onChangeEmailAddress: (email: string) => Promise<void>;
	onChangeNotificationPreference: (
		data: NotificationPreference
	) => Promise<NotificationPreference>;
	onChangePassword: (
		currentPassword: string,
		newPassword: string
	) => Promise<void>;
	onChangeTimeZone: (timeZone: { id: number }) => Promise<void>;
	onCreateAbsoluteUrl: (path: string) => string;
	onDeleteAccount: () => Promise<void>;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
	onLinkAuthServiceAccount: (
		provider: AuthServiceProvider
	) => Promise<AuthServiceAccountAssociation>;
	onGetSettings: FetchFunction<Settings>;
	onGetTimeZones: FetchFunction<TimeZoneSelectListItem[]>;
	onOpenDialog: (dialog: React.ReactNode) => void;
	onOpenTweetComposer: (params: TweetWebIntentParams) => void;
	onRegisterNotificationPreferenceChangedEventHandler: (
		handler: (preference: NotificationPreference) => void
	) => () => void;
	onResendConfirmationEmail: () => Promise<void>;
	onSendPasswordCreationEmail: () => Promise<void>;
	onShowToast: (content: React.ReactNode, intent: Intent) => void;
	onSignOut: () => Promise<void>;
	onSubmitAuthorEmailVerificationRequest: (
		request: AuthorEmailVerificationRequest
	) => Promise<void>;
	onViewPrivacyPolicy: () => void;
	user: UserAccount;
}
class SettingsPage extends React.PureComponent<
	Props,
	{
		highlightedAuthServiceAccountId: number;
		isSigningOut: boolean;
		settings: Fetchable<Settings>;
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeTimeZone = (
		id: number,
		timeZoneDisplayName: string
	) => {
		return this.props.onChangeTimeZone({ id }).then(() => {
			this.setState({
				settings: {
					...this.state.settings,
					value: {
						...this.state.settings.value,
						timeZoneDisplayName,
					},
				},
			});
		});
	};
	private readonly _linkAuthServiceAccount = (
		provider: AuthServiceProvider
	) => {
		return this.props.onLinkAuthServiceAccount(provider).then((association) => {
			this._mergeAuthServiceAccount(association);
			return association;
		});
	};
	private readonly _mergeAuthServiceAccount = (
		account: AuthServiceAccountAssociation
	) => {
		const authServiceAccounts =
				this.state.settings.value.authServiceAccounts.slice(),
			existingAccountIndex = authServiceAccounts.findIndex(
				(existingAccount) => existingAccount.identityId === account.identityId
			);
		if (existingAccountIndex !== -1) {
			authServiceAccounts.splice(existingAccountIndex, 1, account);
		} else {
			authServiceAccounts.unshift(account);
		}
		this.setState({
			highlightedAuthServiceAccountId:
				existingAccountIndex === -1
					? account.identityId
					: this.state.highlightedAuthServiceAccountId,
			settings: {
				...this.state.settings,
				value: {
					...this.state.settings.value,
					authServiceAccounts,
				},
			},
		});
	};
	private readonly _openAccountDeletionDialog = () => {
		this.props.onOpenDialog(
			<AccountDeletionDialog
				onCloseDialog={this.props.onCloseDialog}
				onDeleteAccount={this.props.onDeleteAccount}
				onShowToast={this.props.onShowToast}
			/>
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
		);
	};
	private readonly _signOut = () => {
		this.setState((prevState) => {
			if (prevState.isSigningOut) {
				return null;
			}
			this._asyncTracker
				.addPromise(this.props.onSignOut())
				.then(() => {
					this.setState({
						isSigningOut: false,
					});
				})
				.catch((reason) => {
					if ((reason as CancellationToken)?.isCancelled) {
						return;
					}
					this.setState({
						isSigningOut: false,
					});
				});
			return {
				isSigningOut: true,
			};
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			highlightedAuthServiceAccountId: 0,
			isSigningOut: false,
			settings: props.onGetSettings(
				this._asyncTracker.addCallback((settings) => {
					this.setState({ settings });
				})
			),
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterNotificationPreferenceChangedEventHandler(
				(notificationPreference) => {
					this.setState({
						settings: {
							...this.state.settings,
							value: {
								...this.state.settings.value,
								notificationPreference,
							},
						},
					});
				}
			)
		);
	}
	public componentDidUpdate(prevProps: Props) {
		if (this.props.user.timeZoneId !== prevProps.user.timeZoneId) {
			this.props.onGetSettings(
				this._asyncTracker.addCallback((settings) => {
					this.setState({ settings });
				})
			);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const user = this.props.user;
		return (
			<div className="settings-page_ejwkk">
				{this.props.user.role === UserAccountRole.Admin ? (
					<Button
						onClick={() => this.props.onNavTo({ key: ScreenKey.Admin })}
						className="admin-button"
						text="Admin"
						size="large"
						intent="loud"
						display="block"
					/>
				) : null}
				<SettingsLink
					iconName="question-circle"
					screenKey={ScreenKey.Faq}
					onNavTo={this.props.onNavTo}
				>
					Got a question? We’re here to help
				</SettingsLink>
				<SettingsLink
					iconName="chart"
					screenKey={ScreenKey.Stats}
					onNavTo={this.props.onNavTo}
				>
					View your personal reading stats
				</SettingsLink>
				{this.state.settings.isLoading ? (
					<LoadingOverlay />
				) : (
					<>
						<div className="setting">
							<div className="header">
								<span className="label">Reader Name</span>
								<Separator />
								{user.isPasswordSet ? (
									<Link
										text="Change Password"
										iconLeft="locked"
										onClick={this._openChangePasswordDialog}
									/>
								) : (
									<Link
										iconLeft="locked"
										onClick={this._openSetPasswordDialog}
										text="Set Password"
									/>
								)}
							</div>
							<div className="section">{user.name}</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Email Address</span>
								<Separator />
								<Link
									text="Change"
									iconLeft="write"
									onClick={this._openChangeEmailAddressDialog}
								/>
							</div>
							<div className="section">
								{user.email}
								<div className="indicators">
									{user.isEmailConfirmed ? (
										<div className="status on">
											<Icon name="checkmark" />
											Confirmed
										</div>
									) : (
										<>
											<div className="status warn">
												<Icon name="exclamation" />
												Not Confirmed
											</div>
											<div className="status">
												<AsyncLink
													icon="email"
													onClick={this.props.onResendConfirmationEmail}
													text="Send confirmation email"
												/>
											</div>
										</>
									)}
								</div>
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Display</span>
							</div>
							<div className="section">
								<DisplayPreferencesControl
									onChangeDisplayPreference={
										this.props.onChangeDisplayPreference
									}
									preference={{
										...this.state.settings.value.displayPreference,
										theme: this.props.displayTheme,
									}}
								/>
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Notifications</span>
							</div>
							<div className="section">
								<NotificationPreferencesControl
									preference={this.state.settings.value.notificationPreference}
									onChangeNotificationPreference={
										this.props.onChangeNotificationPreference
									}
								/>
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Time Zone</span>
								<Separator />
								<Link
									text="Change"
									iconLeft="write"
									onClick={this._openChangeTimeZoneDialog}
								/>
							</div>
							<div className="section">
								{this.state.settings.value.timeZoneDisplayName}
							</div>
						</div>
						<div className="setting accounts">
							<div className="header">
								<span className="label">Linked Accounts</span>
								<Separator />
								<Link
									text="Add"
									iconLeft="plus"
									onClick={this._openLinkAccountDialog}
								/>
							</div>
							<div className="section">
								{this.state.settings.value.authServiceAccounts.length
									? this.state.settings.value.authServiceAccounts.map(
											(account) => {
												let identity: string, provider: string;
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
														highlight={
															account.identityId ===
															this.state.highlightedAuthServiceAccountId
														}
														key={account.identityId}
													>
														<div className="provider">{provider}</div>
														<div className="date">
															Added on{' '}
															{DateTime.fromISO(
																formatIsoDateAsUtc(account.dateAssociated)
															).toLocaleString(DateTime.DATE_MED)}
														</div>
														<div className="identity">{identity}</div>
													</ContentBox>
												);
											}
									  )
									: 'No linked accounts found.'}
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Writer Account</span>
							</div>
							<div className="section">
								<WriterAccountControl
									authorProfile={this.state.settings.value.authorProfile}
									onCloseDialog={this.props.onCloseDialog}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onOpenDialog={this.props.onOpenDialog}
									onOpenTweetComposer={this.props.onOpenTweetComposer}
									onShowToast={this.props.onShowToast}
									onSubmitAuthorEmailVerificationRequest={
										this.props.onSubmitAuthorEmailVerificationRequest
									}
								/>
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Current Session</span>
							</div>
							<div className="section">
								<Button
									intent="loud"
									onClick={this._signOut}
									state={this.state.isSigningOut ? 'busy' : 'normal'}
									style="preferred"
									text="Log Out"
								/>
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Legal</span>
							</div>
							<div className="section">
								<Link
									href={findRouteByKey(
										routes,
										ScreenKey.PrivacyPolicy
									).createUrl()}
									onClick={this.props.onViewPrivacyPolicy}
									text="Privacy Policy and Terms of Use"
								/>
							</div>
						</div>
						<div className="setting">
							<div className="header">
								<span className="label">Account Deletion</span>
							</div>
							<div className="section">
								<Link
									onClick={this._openAccountDeletionDialog}
									text="Delete My Account"
								/>
							</div>
						</div>
					</>
				)}
			</div>
		);
	}
}
export default function createSettingsScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'displayTheme' | 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: {
				default: 'Settings'
			},
		}),
		render: (screenState: Screen, sharedState: SharedState) => (
			<SettingsPage
				displayTheme={sharedState.displayTheme}
				onCloseDialog={deps.onCloseDialog}
				onChangeDisplayPreference={deps.onChangeDisplayPreference}
				onChangeEmailAddress={deps.onChangeEmailAddress}
				onChangeNotificationPreference={deps.onChangeNotificationPreference}
				onChangePassword={deps.onChangePassword}
				onChangeTimeZone={deps.onChangeTimeZone}
				onCreateAbsoluteUrl={deps.onCreateAbsoluteUrl}
				onDeleteAccount={deps.onDeleteAccount}
				onOpenDialog={deps.onOpenDialog}
				onOpenTweetComposer={deps.onOpenTweetComposer}
				onGetSettings={deps.onGetSettings}
				onGetTimeZones={deps.onGetTimeZones}
				onRegisterNotificationPreferenceChangedEventHandler={
					deps.onRegisterNotificationPreferenceChangedEventHandler
				}
				onLinkAuthServiceAccount={deps.onLinkAuthServiceAccount}
				onNavTo={deps.onNavTo}
				onResendConfirmationEmail={deps.onResendConfirmationEmail}
				onSendPasswordCreationEmail={deps.onSendPasswordCreationEmail}
				onShowToast={deps.onShowToast}
				onSignOut={deps.onSignOut}
				onSubmitAuthorEmailVerificationRequest={
					deps.onSubmitAuthorEmailVerificationRequest
				}
				onViewPrivacyPolicy={deps.onViewPrivacyPolicy}
				user={sharedState.user}
			/>
		),
	};
}
