import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import Separator from './Separator';
import ActionLink from '../../../common/components/ActionLink';
import Icon from '../../../common/components/Icon';
import * as className from 'classnames';
import EditNotificationsDialog from './SettingsPage/EditNotificationsDialog';
import UserAccount from '../api/models/UserAccount';
import { Intent } from '../Page';

export default class SettingsPage extends PureContextComponent<{}, { isResendingConfirmationEmail: boolean }> {
	private _redirectToHomepage = () => this.context.router.push('/');
	private _updateUserAccount = (userAccount: UserAccount) => this.context.user.update(userAccount);
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this.context.api.getUserAccount(user => {
			this._updateUserAccount(user.value);
			this.context.page.setState({ isLoading: false });
		});
	};
	private _resendConfirmationEmail = () => this.setState(
		{ isResendingConfirmationEmail: true },
		() => this.context.api
			.resendConfirmationEmail()
			.then(() => this.setState(
				{ isResendingConfirmationEmail: false },
				() => this.context.page.showToast('Confirmation email sent!', Intent.Success)
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
	private _showEditNotificationsDialog = () => {
		const user = this.context.user.getUserAccount();
		this.context.page.openDialog(
			<EditNotificationsDialog
				receiveEmailNotifications={user.receiveReplyEmailNotifications}
				receiveDesktopNotifications={user.receiveReplyDesktopNotifications}
				onSuccess={this._updateUserAccount}
				/>
		);
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = { isResendingConfirmationEmail: false };
	}
	public componentWillMount() {
		this.context.page.setState({
			title: 'Settings',
			isLoading: false
		});
	}
	public componentDidMount() {
		this.context.user
			.addListener('signOut', this._redirectToHomepage)
			.addListener('update', this.forceUpdate);
		this.context.page.addListener('reload', this._reload);
		this.context.extension.addListener('change', this._reload);
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signOut', this._redirectToHomepage)
			.removeListener('update', this.forceUpdate);
		this.context.page.removeListener('reload', this._reload);
		this.context.extension.addListener('change', this._reload);
	}
	public render() {
		const user = this.context.user.getUserAccount();
		return (
			<div className="settings-page">
				<ul>
					<li>
						<label>
							<strong>Username</strong>
							<Separator />
							<ActionLink text="Change Password" iconLeft="locked" />
						</label>
						{user.name}
					</li>
					<li>
						<label>
							<strong>Email Address</strong>
							<Separator />
							<ActionLink text="Edit" iconLeft="write" />
						</label>
						{user.email}
						{user.isEmailConfirmed ?
							<span className="email-confirmation-status confirmed">
								<Icon name="checkmark" />
								Confirmed
							</span> :
							<span className="email-confirmation-status unconfirmed">
								<Icon name="exclamation" />
								Not Confirmed
								<Separator />
								<ActionLink
									text="Resend confirmation email"
									iconLeft="refresh2"
									state={this.state.isResendingConfirmationEmail ? 'busy' : 'normal'}
									onClick={this._resendConfirmationEmail}
									/>
							</span>}
					</li>
					<li>
						<label>
							<strong>Notifications</strong>
							<Separator />
							<ActionLink text="Edit" iconLeft="write" onClick={this._showEditNotificationsDialog} />
						</label>
						When someone replies to my comment
						<ul className="notification-channels">
							<li className={className('channel', { enabled: user.receiveReplyEmailNotifications })}>
								<Icon name={user.receiveReplyEmailNotifications ? 'checkmark' : 'cancel'} />
								Send me an email
								{user.receiveReplyEmailNotifications && !user.isEmailConfirmed ?
									<span className="notice">
										<Icon name="exclamation" />
										Disabled until your address is confirmed
									</span> :
									null}
							</li>
							<li className={className('channel', { enabled: user.receiveReplyDesktopNotifications })}>
								<Icon name={user.receiveReplyDesktopNotifications ? 'checkmark' : 'cancel'} />
								Show a desktop notification
								{user.receiveReplyDesktopNotifications && !this.context.extension.isInstalled() ?
									<span className="notice">
										<Icon name="exclamation" />
										Only active when extension is installed
									</span> :
									null}
							</li>
						</ul>
					</li>
				</ul>
			</div>
		);
	}
}