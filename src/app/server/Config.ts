// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import HttpEndpoint from '../../common/HttpEndpoint';

export interface Config {
	apiServer: HttpEndpoint,
	chromeExtensionId: string,
	contentRootPath: string,
	cookieDomain: string,
	cookieName: string,
	logStream?: {
		type: string,
		path: string,
		period: string,
		count: number,
		level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
	},
	packageFilePath: string,
	port?: number | string,
	secureCookie: boolean,
	serveStaticContent: boolean,
	staticServer: HttpEndpoint,
	webServer: HttpEndpoint
}