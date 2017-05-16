import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Separator from './Separator';
import ActionLink from '../../../common/components/ActionLink';
import Icon from '../../../common/components/Icon';

export default class SettingsPage extends PureContextComponent<{}, {}> {
	private _redirectToHomepage = () => this.context.router.push('/');
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this.context.api.getUserAccount(user => {
			this.context.user.update(user.value);
			this.context.page.setState({ isLoading: false });
		});
	};
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
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signOut', this._redirectToHomepage)
			.removeListener('update', this.forceUpdate);
		this.context.page.removeListener('reload', this._reload);
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
							<ActionLink text="Change Password" iconLeft="write" />
						</label>
						{user.name}
					</li>
					<li>
						<label>
							<strong>Email Address</strong>
							<Separator />
							<ActionLink text="Change" iconLeft="write" />
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
								<ActionLink text="Resend confirmation email" iconLeft="refresh2" />
							</span>}
					</li>
					<li>
						<label>
							<strong>Notifications</strong>
						</label>
						When someone replies to my comment
						<ul>
							<li>
								<Icon name={user.receiveReplyEmailNotifications ? 'checkmark' : 'cancel'} />
								Send me an email
							</li>
							<li>
								<Icon name={user.receiveReplyDesktopNotifications ? 'checkmark' : 'cancel'} />
								Show a desktop notification
							</li>
							<li>
								<ActionLink text="Change Preferences" iconLeft="write" />
							</li>
						</ul>
					</li>
				</ul>
			</div>
		);
	}
}