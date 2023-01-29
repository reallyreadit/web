// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import AppApi, { ArticleReference } from '../common/AppApi';
import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import SemanticVersion from '../../common/SemanticVersion';
import { ShareEvent } from '../../common/sharing/ShareEvent';
import DeviceInfo from '../../common/models/app/DeviceInfo';
import SerializedDeviceInfo from '../../common/models/app/SerializedDeviceInfo';
import UserAccount from '../../common/models/UserAccount';
import ShareResult from '../../common/models/app/ShareResult';
import NotificationAuthorizationRequestResult from '../../common/models/app/NotificationAuthorizationRequestResult';
import SignInEventType from '../../common/models/userAccounts/SignInEventType';
import SignInEventResponse from '../../common/models/app/SignInEventResponse';
import WebAuthResponse from '../../common/models/app/WebAuthResponse';
import WebAuthRequest from '../../common/models/app/WebAuthRequest';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';
import { ExternalUrlCompletionEvent } from '../../common/models/app/ExternalUrlCompletionEvent';
import { AppPlatform } from '../../common/AppPlatform';

export default class extends AppApi {
	private readonly _messagingContext: WebViewMessagingContext;
	private readonly _deviceInfoQueue: ((deviceInfo: DeviceInfo) => void)[] = [];
	constructor(params: {
		messagingContext: WebViewMessagingContext;
		platform: AppPlatform;
	}) {
		super({
			platform: params.platform,
		});
		this._messagingContext = params.messagingContext;
		params.messagingContext.addListener((message) => {
			switch (message.type) {
				case 'alertStatusUpdated':
					this.emitEvent('alertStatusUpdated', message.data);
					break;
				case 'articlePosted':
					this.emitEvent('articlePosted', message.data);
					break;
				case 'articleStarred':
					this.emitEvent('articleStarred', message.data);
					break;
				case 'articleUpdated':
					this.emitEvent('articleUpdated', message.data);
					break;
				case 'authenticateAppleIdCredential':
					this.emitEvent('authenticateAppleIdCredential', message.data);
					break;
				case 'authServiceAccountLinked':
					this.emitEvent('authServiceAccountLinked', message.data);
					break;
				case 'commentPosted':
					this.emitEvent('commentPosted', message.data);
					break;
				case 'commentUpdated':
					this.emitEvent('commentUpdated', message.data);
					break;
				case 'didBecomeActive':
					this.emitEvent('didBecomeActive', message.data);
					break;
				case 'displayPreferenceChanged':
					this.emitEvent('displayPreferenceChanged', message.data);
					break;
				case 'deviceInfoUpdated':
					this.setDeviceInfo(message.data);
					break;
				case 'loadUrl':
					this.emitEvent('loadUrl', message.data);
					break;
				case 'updateAvailable':
					this.emitEvent('updateAvailable', message.data);
					break;
			}
		});
		// one day we'll switch to calling initialize()
		// from AppRoot componentDidMount() and setting the
		// device info there.
		// for now we'll keep sending/setting this asap
		params.messagingContext.sendMessage(
			{
				type: 'getDeviceInfo',
			},
			(deviceInfo: SerializedDeviceInfo) => {
				this.setDeviceInfo(deviceInfo);
				this.flushDeviceInfoQueue();
			}
		);
		// legacy app < version 5.0.0
		params.messagingContext.sendMessage(
			{
				type: 'getVersion',
			},
			(version: string) => {
				this._deviceInfo.appVersion = new SemanticVersion(version);
				this.flushDeviceInfoQueue();
			}
		);
	}
	private flushDeviceInfoQueue() {
		while (this._deviceInfoQueue.length) {
			this._deviceInfoQueue.shift()(this._deviceInfo);
		}
	}
	private setDeviceInfo(deviceInfo: SerializedDeviceInfo) {
		this._deviceInfo = {
			...deviceInfo,
			appPlatform: this._deviceInfo.appPlatform,
			appVersion: new SemanticVersion(deviceInfo.appVersion),
		};
	}
	public displayPreferenceChanged(preference: DisplayPreference) {
		this._messagingContext.sendMessage({
			type: 'displayPreferenceChanged',
			data: preference,
		});
	}
	public getDeviceInfo() {
		if (
			this._deviceInfo.appVersion.compareTo(new SemanticVersion('0.0.0')) > 0
		) {
			return Promise.resolve(this._deviceInfo);
		}
		return new Promise<DeviceInfo>((resolve) => {
			this._deviceInfoQueue.push(resolve);
		});
	}
	public initialize(user?: UserAccount) {
		return new Promise<DeviceInfo>((resolve) => {
			this._messagingContext.sendMessage(
				{
					type: 'initialize',
					data: {
						user,
					},
				},
				resolve
			);
		});
	}
	public installUpdate() {
		this._messagingContext.sendMessage({
			type: 'installUpdate',
		});
	}
	public openExternalUrl(url: string) {
		this._messagingContext.sendMessage({
			type: 'openExternalUrl',
			data: url,
		});
	}
	public openExternalUrlUsingSystem(url: string) {
		this._messagingContext.sendMessage({
			type: 'openExternalUrlUsingSystem',
			data: url,
		});
	}
	public openExternalUrlWithCompletionHandler(url: string) {
		return new Promise<ExternalUrlCompletionEvent>((resolve) => {
			this._messagingContext.sendMessage(
				{
					type: 'openExternalUrlWithCompletionHandler',
					data: url,
				},
				resolve
			);
		});
	}
	public readArticle(reference: ArticleReference) {
		this._messagingContext.sendMessage({
			type: 'readArticle',
			data: reference,
		});
	}
	public requestAppleIdCredential() {
		this._messagingContext.sendMessage({
			type: 'requestAppleIdCredential',
		});
	}
	public requestNotificationAuthorization() {
		return new Promise<NotificationAuthorizationRequestResult>((resolve) => {
			this._messagingContext.sendMessage(
				{
					type: 'requestNotificationAuthorization',
				},
				resolve
			);
		});
	}
	public requestWebAuthentication(request: WebAuthRequest) {
		return new Promise<WebAuthResponse>((resolve) => {
			this._messagingContext.sendMessage(
				{
					type: 'requestWebAuthentication',
					data: request,
				},
				resolve
			);
		});
	}
	public share(data: ShareEvent) {
		return new Promise<ShareResult>((resolve) => {
			this._messagingContext.sendMessage(
				{
					type: 'share',
					data,
				},
				resolve
			);
		});
	}
	public signIn(user: UserAccount, eventType: SignInEventType) {
		return new Promise<SignInEventResponse>((resolve) => {
			this._messagingContext.sendMessage(
				{
					type: 'signIn',
					data: {
						user,
						eventType,
					},
				},
				resolve
			);
		});
	}
	public signOut() {
		this._messagingContext.sendMessage({
			type: 'signOut',
		});
	}
	public syncAuthCookie(user?: UserAccount) {
		this._messagingContext.sendMessage({
			type: 'syncAuthCookie',
			data: user,
		});
	}
}
