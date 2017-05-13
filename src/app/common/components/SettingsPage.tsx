import * as React from 'react';
import PureContextComponent from '../PureContextComponent';
import Button from './Button';
import Context from '../Context';

export default class SettingsPage extends PureContextComponent<{}, { isLoading: boolean }> {
	private _redirectToHomepage = () => this.context.router.push('/');
	private _refreshUserAccount = () => this.setState(
		{ isLoading: true },
		() => this.context.api.getUserAccount(user => {
			this.setState({ isLoading: false });
			this.context.user.update(user.value);
		})
	);
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = { isLoading: false };
	}
	public componentWillMount() {
		this.context.pageTitle.set('Settings');
	}
	public componentDidMount() {
		this.context.user
			.addListener('signOut', this._redirectToHomepage)
			.addListener('change', this.forceUpdate);
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signOut', this._redirectToHomepage)
			.removeListener('change', this.forceUpdate);
	}
	public render() {
		const user = this.context.user.getUserAccount();
		return (
			<div className="settings-page">
				<Button text="Refresh" iconLeft="refresh" onClick={this._refreshUserAccount} state={this.state.isLoading ? 'busy' : 'normal'} />
				<ul>
					<li>
						<label>Username</label>
						<span>{user.name}</span>
					</li>
					<li>
						<label>Password</label>
						<span>[Change Password]</span>
					</li>
					<li>
						<label>Email</label>
						<span>{user.email}</span>
					</li>
					<li>
						<label>Reply Notifications</label>
						<label><input type="checkbox" checked={user.receiveReplyEmailNotifications} /> Send Email</label>
						<label><input type="checkbox" checked={user.receiveReplyDesktopNotifications} /> Show Desktop Notification</label>
					</li>
				</ul>
			</div>
		);
	}
}