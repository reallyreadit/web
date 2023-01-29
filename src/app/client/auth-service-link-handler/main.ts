// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import BrowserApi from '../../../common/BrowserApi';
import ExtensionApi from '../ExtensionApi';
import { parseQueryString } from '../../../common/routing/queryString';
import { AuthServiceBrowserLinkResponse } from '../../../common/models/auth/AuthServiceBrowserLinkResponse';

const response = JSON.parse(
	parseQueryString(window.location.search)['body']
) as AuthServiceBrowserLinkResponse;
new BrowserApi().authServiceLinkCompleted(response);
new ExtensionApi().authServiceLinkCompleted(response);
