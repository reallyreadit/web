import * as React from 'react';
import Api from '../api/Api';
import { contextTypes } from '../Context';
import Page from '../Page';
import User from '../User';
import NewReplyNotification from '../../../common/models/NewReplyNotification';
import Logger from '../../../common/Logger';
import Environment from '../Environment';
import App from '../App';
import Extension from '../Extension';
import ClientType from '../ClientType';
import Challenge from '../Challenge';
import EventType from '../EventType';

export default class extends React.Component<{
	api: Api,
	challenge: Challenge,
	environment: Environment<App, Extension>,
	log: Logger,
	page: Page,
	user: User
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
	private _handleSignIn = (event: { eventType: EventType }) => {
		if (!window.document.hidden) {
			this._checkNewReplyNotification();
			this._startPolling();
		}
		if (event.eventType === EventType.Original) {
			this.props.api.getChallengeState(state => {
				this.props.challenge.update(state.value);
			});
		}
	};
	private _handleSignOut = () => {
		this.props.page.setNewReplyNotification({
			lastReply: 0,
			lastNewReplyAck: 0,
			lastNewReplyDesktopNotification: 0,
			timestamp: Date.now()
		});
		this.props.challenge.update({
			latestResponse: null,
			score: null
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
	private _updateExtension = (
		data: {
			notification: NewReplyNotification,
			eventType: EventType
		}
	) => {
		if (
			data.eventType === EventType.Original &&
			this.props.environment.clientType === ClientType.Browser
		) {
			this.props.environment.extension.updateNewReplyNotification(data.notification);
		}
	};
	public static childContextTypes = contextTypes;
	public componentDidMount() {
		// update extension since we just loaded with a fresh notification state
		this._updateExtension({
			notification: this.props.page.newReplyNotification,
			eventType: EventType.Original
		});
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
			challenge: this.props.challenge,
			environment: this.props.environment,
			log: this.props.log,
			page: this.props.page,
			user: this.props.user
		};
	}
	public render () {
		return React.Children.only(this.props.children);
	}
}