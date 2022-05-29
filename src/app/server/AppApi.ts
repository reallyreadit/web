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
import { ShareEvent } from '../../common/sharing/ShareEvent';
import UserAccount from '../../common/models/UserAccount';
import SignInEventType from '../../common/models/userAccounts/SignInEventType';
import WebAuthRequest from '../../common/models/app/WebAuthRequest';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';

export default class extends AppApi {
	public displayPreferenceChanged(preference: DisplayPreference) {
		throw new Error('Operation not supported in server environment');
	}
	public getDeviceInfo() {
		return Promise.reject('Operation not supported in server environment');
	}
	public initialize(user?: UserAccount) {
		return Promise.reject('Operation not supported in server environment');
	}
	public installUpdate() {
		throw new Error('Operation not supported in server environment');
	}
	public openExternalUrl(url: string) {
		throw new Error('Operation not supported in server environment');
	}
	public openExternalUrlUsingSystem(url: string) {
		throw new Error('Operation not supported in server environment');
	}
	public openExternalUrlWithCompletionHandler(url: string) {
		return Promise.reject('Operation not supported in server environment');
	}
	public readArticle(reference: ArticleReference) {
		throw new Error('Operation not supported in server environment');
	}
	public requestAppleIdCredential() {
		throw new Error('Operation not supported in server environment');
	}
	public requestNotificationAuthorization() {
		return Promise.reject('Operation not supported in server environment');
	}
	public requestWebAuthentication(request: WebAuthRequest) {
		return Promise.reject('Operation not supported in server environment');
	}
	public share(data: ShareEvent) {
		return Promise.reject('Operation not supported in server environment');
	}
	public signIn(user: UserAccount, eventType: SignInEventType) {
		return Promise.reject('Operation not supported in server environment');
	}
	public signOut() {
		throw new Error('Operation not supported in server environment');
	}
	public syncAuthCookie(user?: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
}