import * as React from 'react';
import Api from '../api/Api';
import { contextTypes } from '../Context';
import Page from '../Page';
import User from '../User';
import Extension from '../Extension';
import NewReplyNotification from '../../../common/models/NewReplyNotification';

export default class App extends React.Component<{
	api: Api,
	page: Page,
	user: User,
	extension: Extension,
	environment: 'server' | 'browser'
}, {}> {
	private _checkNewReplyNotification = () => this.props.api.checkNewReplyNotification(notification => {
		if (!notification.errors) {
			this.props.page.setNewReplyNotification(notification.value);
		}
	});
	private _pollingHandle: number;
	private _startPolling = () => {
		if (this._pollingHandle == null) {
			this._pollingHandle = window.setInterval(this._checkNewReplyNotification, 60000);
		}
	};
	private _stopPolling = () => {
		if (this._pollingHandle != null) {
			window.clearInterval(this._pollingHandle);
			this._pollingHandle = null;
		}
	};
	private _handleSignIn = () => {
		if (!window.document.hidden) {
			this._checkNewReplyNotification();
			this._startPolling();
		}
	};
	private _handleSignOut = () => {
		this.props.page.setNewReplyNotification({
			lastReply: 0,
			lastNewReplyAck: 0,
			lastNewReplyDesktopNotification: 0,
			timestamp: Date.now()
		});
		this._stopPolling();
	};
	private _handleVisibilityChange = () => {
		if (this.props.user.isSignedIn) {
			if (document.hidden) {
				this._stopPolling();
			} else {
				this._startPolling();
			}
		}
	};
	private _updateExtension = (notification: NewReplyNotification) => this.props.extension.updateNewReplyNotification(notification);
	public static childContextTypes = contextTypes;
	public componentDidMount() {
		// update extension since we just loaded with a fresh notification state
		this.props.extension.updateNewReplyNotification(this.props.page.newReplyNotification);
		// set up event handlers
		this.props.user
			.addListener('signIn', this._handleSignIn)
			.addListener('signOut', this._handleSignOut);
		this.props.page.addListener('newReplyNotificationChange', this._updateExtension);
		window.document.addEventListener('visibilitychange', this._handleVisibilityChange);
		// start polling
		if (this.props.user.isSignedIn && !window.document.hidden) {
			this._startPolling();
		}
	}
	public componentWillUnmount() {
		// remove event handlers
		this.props.user
			.removeListener('signIn', this._handleSignIn)
			.removeListener('signOut', this._handleSignOut);
		this.props.page.removeListener('newReplyNotificationChange', this._updateExtension);
		window.document.removeEventListener('visibilitychange', this._handleVisibilityChange);
		// stop polling
		this._stopPolling();
	}
	public getChildContext() {
		return {
			api: this.props.api,
			page: this.props.page,
			user: this.props.user,
			extension: this.props.extension,
			environment: this.props.environment
		};
	}
	public render () {
		return React.Children.only(this.props.children);
	}
}