import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import Separator from '../../../common/components/Separator';
import ActionLink from '../../../common/components/ActionLink';
import Icon from '../../../common/components/Icon';
import * as className from 'classnames';
import EditContactPreferencesDialog from './SettingsPage/EditContactPreferencesDialog';
import EditNotificationsDialog from './SettingsPage/EditNotificationsDialog';
import ChangePasswordDialog from './SettingsPage/ChangePasswordDialog';
import ChangeEmailAddressDialog from './SettingsPage/ChangeEmailAddressDialog';
import UserAccount from '../../../common/models/UserAccount';
import { Intent } from '../Page';

export default class SettingsPage extends React.PureComponent<RouteComponentProps<{}>, { isResendingConfirmationEmail: boolean }> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => this.forceUpdate();
	private _redirectToHomepage = () => this.context.router.history.push('/');
	private _updateUserAccount = (userAccount: UserAccount) => this.context.user.update(userAccount);
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this.context.api.getUserAccount(user => {
			this._updateUserAccount(user.value);
			this.context.page.setState({ isLoading: false });
		});
	};
	private _openChangePasswordDialog = () => {
		this.context.page.openDialog(<ChangePasswordDialog />);
	};
	private _openChangeEmailAddressDialog = () => {
		this.context.page.openDialog(<ChangeEmailAddressDialog />);
	};
	private _resendConfirmationEmail = () => this.setState(
		{ isResendingConfirmationEmail: true },
		() => this.context.api
			.resendConfirmationEmail()
			.then(() => this.setState(
				{ isResendingConfirmationEmail: false },
				() => this.context.page.showToast('Confirmation email sent', Intent.Success)
			))
			.catch((errors: string[]) => this.setState(
				{ isResendingConfirmationEmail: false },
				() => this.context.page.showToast(
					errors.includes('ResendLimitExceeded') ?
						'Only one resend allowed per 24 hours.\nPlease try again later.' :
						'Error sending email.\nPlease try again later.',
					Intent.Danger
				)
			))
	);
	private _openEditNotificationsDialog = () => {
		const user = this.context.user.userAccount;
		this.context.page.openDialog(
			<EditNotificationsDialog
				receiveEmailNotifications={user.receiveReplyEmailNotifications}
				receiveDesktopNotifications={user.receiveReplyDesktopNotifications}
				onSuccess={this._updateUserAccount}
			/>
		);
	};
	private _openEditContactPreferencesDialog = () => {
		const user = this.context.user.userAccount;
		this.context.page.openDialog(
			<EditContactPreferencesDialog
				receiveWebsiteUpdates={user.receiveWebsiteUpdates}
				receiveSuggestedReadings={user.receiveSuggestedReadings}
				onSuccess={this._updateUserAccount}
			/>
		);
	};
	private _installExtension = (e: React.MouseEvent<HTMLAnchorElement>) => chrome.webstore.install();
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		this.state = { isResendingConfirmationEmail: false };
	}
	public componentWillMount() {
		this.context.page.setState({
			title: 'Settings',
			isLoading: false,
			isReloadable: true
		});
	}
	public componentDidMount() {
		this.context.user
			.addListener('signOut', this._redirectToHomepage)
			.addListener('update', this._forceUpdate);
		this.context.page.addListener('reload', this._reload);
		this.context.extension.addListener('change', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signOut', this._redirectToHomepage)
			.removeListener('update', this._forceUpdate);
		this.context.page.removeListener('reload', this._reload);
		this.context.extension.addListener('change', this._forceUpdate);
	}
	public render() {
		const user = this.context.user.userAccount;
		return (
			<div className="settings-page">
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
							<div className="setting off">
								<Icon name="exclamation" />
								Not Confirmed
								<Separator />
								<ActionLink
									text="Resend confirmation email"
									iconLeft="refresh2"
									state={this.state.isResendingConfirmationEmail ? 'busy' : 'normal'}
									onClick={this._resendConfirmationEmail}
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
						<div className={className('setting', user.receiveReplyEmailNotifications ? 'on' : 'off')}>
							<Icon name={user.receiveReplyEmailNotifications ? 'checkmark' : 'cancel'} />
							Send me an email
						</div>
						<div className={className('setting', user.receiveReplyDesktopNotifications ? 'on' : 'off')}>
							<Icon name={user.receiveReplyDesktopNotifications ? 'checkmark' : 'cancel'} />
							Show a desktop notification
							{user.receiveReplyDesktopNotifications && this.context.environment === 'browser' && this.context.extension.isInstalled() === false ?
								<div className="notice">
									<Icon name="exclamation" />
									To get notifications you must {this.context.extension.isBrowserCompatible() ?
										<a onClick={this._installExtension}>add the Chrome extension</a> :
										<span>add the Chrome extension</span>}.
								</div> :
								null}
						</div>
					</li>
					<li>
						<label>
							<strong>Contact Preferences</strong>
							<Separator />
							<ActionLink text="Edit" iconLeft="write" onClick={this._openEditContactPreferencesDialog} />
						</label>
						Feel free to occasionally email me about the following:
						<div className={className('setting', user.receiveWebsiteUpdates ? 'on' : 'off')}>
							<Icon name={user.receiveWebsiteUpdates ? 'checkmark' : 'cancel'} />
							Community updates
						</div>
						<div className={className('setting', user.receiveSuggestedReadings ? 'on' : 'off')}>
							<Icon name={user.receiveSuggestedReadings ? 'checkmark' : 'cancel'} />
							Suggested readings
						</div>
					</li>
				</ul>
			</div>
		);
	}
}