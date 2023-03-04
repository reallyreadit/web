// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import RouteLocation from './RouteLocation';
import { parseQueryString, unroutableQueryStringKeys } from './queryString';
import UserAccountRole from '../models/UserAccountRole';
import routes from './routes';

export interface Route<TDialogKey, TScreenKey> {
	authLevel?: UserAccountRole;
	createUrl: (params?: { [key: string]: string }) => string;
	dialogKey?: TDialogKey;
	getPathParams?: (path: string) => { [key: string]: string };
	noIndex?: (path: string) => boolean;
	pathRegExp: RegExp;
	queryStringKeys?: string[];
	screenKey: TScreenKey;
}
export function findRouteByLocation<TDialogKey, TScreenKey>(
	routes: Route<TDialogKey, TScreenKey>[],
	location: RouteLocation,
	qsKeysToExclude?: string[]
) {
	let matches = routes.filter((route) => route.pathRegExp.test(location.path));
	if (!matches) {
		return null;
	}
	let keysToMatch: string[];
	if (
		location.queryString &&
		(keysToMatch = Object.keys(parseQueryString(location.queryString)).filter(
			(key) => !(qsKeysToExclude || []).includes(key)
		)).length
	) {
		matches = matches.filter(
			(route) =>
				route.queryStringKeys &&
				route.queryStringKeys.length === keysToMatch.length &&
				route.queryStringKeys.every((key) => keysToMatch.includes(key))
		);
	} else {
		matches = matches.filter((route) => !route.queryStringKeys);
	}
	if (matches.length === 1) {
		return matches[0];
	}
	return null;
}
export function findRouteByKey<TDialogKey, TScreenKey>(
	routes: Route<TDialogKey, TScreenKey>[],
	screenKey: TScreenKey,
	dialogKey?: TDialogKey
) {
	let matches = routes.filter((route) => route.screenKey === screenKey);
	if (!matches) {
		return null;
	}
	if (dialogKey != null) {
		matches = matches.filter((route) => route.dialogKey === dialogKey);
	} else {
		matches = matches.filter((route) => route.dialogKey == null);
	}
	if (matches.length) {
		return matches[0];
	}
	return null;
}
export function parseUrlForRoute(urlString: string) {
	try {
		const url = new URL(urlString);
		if (/^(dev\.)?(readup\.(com|org)|reallyread\.it)$/.test(url.hostname)) {
			const route = findRouteByLocation(
				routes,
				{
					path: url.pathname,
					queryString: url.search,
				},
				unroutableQueryStringKeys
			);
			if (route) {
				return {
					isInternal: true,
					route,
					url,
				};
			} else {
				return {
					isInternal: true,
					route: null,
					url,
				};
			}
		} else {
			return {
				isInternal: false,
				route: null,
				url,
			};
		}
	} catch {
		return {
			isInternal: false,
			route: null,
			url: null,
		};
	}
}
