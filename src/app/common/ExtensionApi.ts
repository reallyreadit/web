// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import EventEmitter from '../../common/EventEmitter';
import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import UserAccount from '../../common/models/UserAccount';
import ExtensionInstallationEvent from '../../common/ExtensionInstallationEvent';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';
import SemanticVersion from '../../common/SemanticVersion';
import HttpEndpoint from '../../common/HttpEndpoint';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import {ReadArticleReference} from './components/Root';

export interface Params {
	installedVersion: SemanticVersion | null,
	webServerEndpoint: HttpEndpoint
}
export default abstract class ExtensionApi extends EventEmitter<{
	'articlePosted': Post,
	'articleUpdated': ArticleUpdatedEvent,
	'displayPreferenceChanged': DisplayPreference,
	'installationStatusChanged': SemanticVersion | null,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'userUpdated': UserAccount
}> {
	protected readonly _extensionVersionCookieAttributes: Cookies.CookieAttributes | null;
	protected _installedVersion: SemanticVersion | null;
	constructor(params?: Params) {
		super();
		// params are optional in order to support the auth service link handler
		// which just needs to send a message to the extension if installed, not
		// process installation events or cookies
		if (params) {
			this._extensionVersionCookieAttributes = {
				domain: '.' + params.webServerEndpoint.host,
				sameSite: 'none',
				secure: params.webServerEndpoint.protocol === 'https'
			};
			this._installedVersion = params.installedVersion;
		} else {
			this._installedVersion = new SemanticVersion('0.0.0');
		}
	}
	public abstract articleUpdated(event: ArticleUpdatedEvent): void;
	public abstract authServiceLinkCompleted(response: AuthServiceBrowserLinkResponse): void;
	public abstract commentPosted(comment: CommentThread): void;
	public abstract commentUpdated(comment: CommentThread): void;
	public abstract displayPreferenceChanged(preference: DisplayPreference): void;
	public abstract extensionInstallationEventReceived(event: ExtensionInstallationEvent): void;
	public abstract readArticle(article: ReadArticleReference): void;
	public abstract userSignedIn(profile: WebAppUserProfile): void;
	public abstract userSignedOut(): void;
	public abstract userUpdated(user: UserAccount): void;
	public get installedVersion() {
		return this._installedVersion;
	}
	public get isInstalled() {
		return !!this._installedVersion;
	}
}