// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import NotificationPreference from './notifications/NotificationPreference';
import AuthServiceAccountAssociation from './auth/AuthServiceAccountAssociation';
import DisplayPreference from './userAccounts/DisplayPreference';
import AuthorProfile from './authors/AuthorProfile';

export default interface Settings {
	displayPreference: DisplayPreference;
	notificationPreference: NotificationPreference;
	timeZoneDisplayName: string;
	authServiceAccounts: AuthServiceAccountAssociation[];
	authorProfile: AuthorProfile | null;
}
