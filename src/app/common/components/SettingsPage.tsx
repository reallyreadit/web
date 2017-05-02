import * as React from 'react';
import PureContextComponent from '../PureContextComponent';

export default class SettingsPage extends PureContextComponent<{}, {}> {
	private _redirectToHomepage = () => this.context.router.push('/');
	public componentWillMount() {
		this.context.pageTitle.set('Settings');
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._redirectToHomepage);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._redirectToHomepage);
	}
	public render() {
		return (
			<div className="settings-page">
				<span>Settings!</span>
			</div>
		);
	}
}