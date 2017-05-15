import * as React from 'react';
import PureContextComponent from '../PureContextComponent';

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