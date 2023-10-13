// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import EventEmitter from './EventEmitter';
import UserAccount from './models/UserAccount';
import SemanticVersion from './SemanticVersion';
import ArticleUpdatedEvent from './models/ArticleUpdatedEvent';
import CommentThread from './models/CommentThread';
import Post from './models/social/Post';
import NotificationPreference from './models/notifications/NotificationPreference';
import ExtensionInstallationEvent from './ExtensionInstallationEvent';
import { AuthServiceBrowserLinkResponse } from './models/auth/AuthServiceBrowserLinkResponse';
import WebAppUserProfile from './models/userAccounts/WebAppUserProfile';
import DisplayPreference from './models/userAccounts/DisplayPreference';
import { ScreenTitle } from './ScreenTitle';

export default abstract class BrowserApiBase extends EventEmitter<{
	articleUpdated: ArticleUpdatedEvent;
	articlePosted: Post;
	authServiceLinkCompleted: AuthServiceBrowserLinkResponse;
	commentPosted: CommentThread;
	commentUpdated: CommentThread;
	displayPreferenceChanged: DisplayPreference;
	extensionInstallationChanged: ExtensionInstallationEvent;
	notificationPreferenceChanged: NotificationPreference;
	updateAvailable: SemanticVersion;
	userSignedIn: WebAppUserProfile | UserAccount;
	userSignedOut: void;
	userUpdated: UserAccount;
}> {
	public abstract articleUpdated(event: ArticleUpdatedEvent): void;
	public abstract articlePosted(post: Post): void;
	public abstract authServiceLinkCompleted(
		response: AuthServiceBrowserLinkResponse
	): void;
	public abstract commentPosted(comment: CommentThread): void;
	public abstract commentUpdated(comment: CommentThread): void;
	public abstract displayPreferenceChanged(preference: DisplayPreference): void;
	public abstract extensionInstallationChanged(
		event: ExtensionInstallationEvent
	): void;
	public abstract notificationPreferenceChanged(
		preference: NotificationPreference
	): void;
	public abstract setTitle(title: ScreenTitle): void;
	public abstract updateAvailable(version: SemanticVersion): void;
	public abstract userSignedIn(profile: WebAppUserProfile): void;
	public abstract userSignedOut(): void;
	public abstract userUpdated(user: UserAccount): void;
}
