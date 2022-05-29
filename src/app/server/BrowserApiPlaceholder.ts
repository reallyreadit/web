// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import BrowserApiBase from '../../common/BrowserApiBase';
import UserAccount from '../../common/models/UserAccount';
import SemanticVersion from '../../common/SemanticVersion';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import Post from '../../common/models/social/Post';
import NotificationPreference from '../../common/models/notifications/NotificationPreference';
import ExtensionInstallationEvent from '../../common/ExtensionInstallationEvent';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';

export default class BrowserApiPlaceholder extends BrowserApiBase {
	private _title: string;
	public setTitle(title: string) {
		this._title = title;
	}
	public articleUpdated(event: ArticleUpdatedEvent) {
		throw new Error('Operation not supported in server environment');
	}
	public articlePosted(post: Post) {
		throw new Error('Operation not supported in server environment');
	}
	public authServiceLinkCompleted(response: AuthServiceBrowserLinkResponse) {
		throw new Error('Operation not supported in server environment');
	}
	public commentPosted(comment: CommentThread) {
		throw new Error('Operation not supported in server environment');
	}
	public commentUpdated(comment: CommentThread) {
		throw new Error('Operation not supported in server environment');
	}
	public displayPreferenceChanged(preference: DisplayPreference) {
		throw new Error('Operation not supported in server environment');
	}
	public extensionInstallationChanged(event: ExtensionInstallationEvent) {
		throw new Error('Operation not supported in server environment');
	}
	public getTitle() {
		return this._title;
	}
	public notificationPreferenceChanged(preference: NotificationPreference) {
		throw new Error('Operation not supported in server environment');
	}
	public updateAvailable(version: SemanticVersion) {
		throw new Error('Operation not supported in server environment');
	}
	public userSignedIn(profile: WebAppUserProfile) {
		throw new Error('Operation not supported in server environment');
	}
	public userSignedOut() {
		throw new Error('Operation not supported in server environment');
	}
	public userUpdated(user: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
}