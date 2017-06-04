import * as React from 'react';
import Api from '../api/Api';
import contextTypes from '../contextTypes';
import Page from '../Page';
import User from '../User';
import Extension from '../Extension';
import NewReplyNotification from '../../../common/models/NewReplyNotification';
import Fetchable from '../api/Fetchable';

export default class App extends React.Component<{
	api: Api,
	page: Page,
	user: User,
	extension: Extension,
	environment: 'server' | 'browser'
}, {}> {
	private _setNotificationState = (notification: Fetchable<NewReplyNotification>) => {
		if (!notification.errors) {
			this.props.page.setNewReplyNotificationState(notification.value);
		}
	};
	private _ackNewReply = () => this.props.api.ackNewReply();
	private _pollingHandle: number;
	private _startPolling = () => this._pollingHandle = window.setInterval(() => this.props.api.checkNewReplyNotification(this._setNotificationState), 10000);
	private _stopPolling = () => window.clearInterval(this._pollingHandle);
	public static childContextTypes = contextTypes;
	public getChildContext() {
		return {
			api: this.props.api,
			page: this.props.page,
			user: this.props.user,
			extension: this.props.extension,
			environment: this.props.environment
		};
	}
	public componentWillMount() {
		if (this.props.user.isSignedIn) {
			const notification = this.props.api.checkNewReplyNotification(this._setNotificationState);
			if (!notification.isLoading && !notification.errors) {
				this.props.page.setNewReplyNotificationState(notification.value);
			}
		}
	}
	public componentDidMount() {
		this.props.page.addListener('ackNewReply', this._ackNewReply);
		this.props.user
			.addListener('signIn', this._startPolling)
			.addListener('signOut', this._stopPolling);
		if (this.props.user.isSignedIn) {
			this._startPolling();
		}
	}
	public componentWillUnmount() {
		this.props.page.removeListener('ackNewReply', this._ackNewReply);
		this.props.user
			.removeListener('signIn', this._startPolling)
			.removeListener('signOut', this._stopPolling);
		if (this.props.user.isSignedIn) {
			this._stopPolling();
		}
	}
	public render () {
		return React.Children.only(this.props.children);
	}
}