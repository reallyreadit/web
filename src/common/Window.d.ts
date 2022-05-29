// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import HttpEndpoint from './HttpEndpoint';
import PackageVersionInfo from './PackageVersionInfo';

declare global {
	interface AppWindow {
		// iOS keyboard scroll bug
		isFocusedOnField: boolean
	}
	interface AlertContentScriptWindow { }
	interface EmbedWindow { }
	interface ReaderContentScriptWindow { }
	interface ReaderWindow { }
	interface Window {
		reallyreadit: {
			alertContentScript?: AlertContentScriptWindow,
			app?: AppWindow,
			embed?: EmbedWindow,
			extension?: {
				config?: {
					apiServer: HttpEndpoint,
					cookieName: string,
					cookieDomain: string,
					staticServer: HttpEndpoint,
					webServer: HttpEndpoint,
					version: PackageVersionInfo
				}
			},
			nativeClient?: {
				reader: ReaderWindow
			}
		},
		webkit: {
			messageHandlers: {
				reallyreadit: {
					postMessage: (message: any) => void
				}
			}
		}
	}
}