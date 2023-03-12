// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ExtensionApi from '../common/ExtensionApi';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import CommentThread from '../../common/models/CommentThread';
import UserAccount from '../../common/models/UserAccount';
import ExtensionInstallationEvent from '../../common/ExtensionInstallationEvent';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import { ReadArticleReference } from '../common/components/Root';

export default class extends ExtensionApi {
	public articleUpdated(event: ArticleUpdatedEvent) {
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
	public extensionInstallationEventReceived(event: ExtensionInstallationEvent) {
		throw new Error('Operation not supported in server environment');
	}
	public readArticle(article: ReadArticleReference): void {
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
