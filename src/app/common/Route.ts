import Location from './Location';
import { parseQueryString } from './queryString';

export interface Route<TDialogKey, TScreenKey> {
	createUrl: (params?: { [key: string]: string }) => string,
	dialogKey?: TDialogKey,
	pathRegExp: RegExp,
	queryStringKeys?: string[],
	screenKey: TScreenKey
}
export function findRouteByLocation<TDialogKey, TScreenKey>(routes: Route<TDialogKey, TScreenKey>[], location: Location, qsKeysToExclude?: string[]) {
	let matches = routes.filter(route => route.pathRegExp.test(location.path));
	if (!matches) {
		return null;
	}
	let keysToMatch: string[];
	if (
		location.queryString && (
			keysToMatch = Object
				.keys(parseQueryString(location.queryString))
				.filter(key => !(qsKeysToExclude || []).includes(key))
		).length
	) {
		matches = matches.filter(route => (
			route.queryStringKeys &&
			route.queryStringKeys.length === keysToMatch.length &&
			route.queryStringKeys.every(key => keysToMatch.includes(key))
		));
	} else {
		matches = matches.filter(route => !route.queryStringKeys);
	}
	if (matches.length === 1) {
		return matches[0];
	}
	return null;
}
export function findRouteByKey<TDialogKey, TScreenKey>(routes: Route<TDialogKey, TScreenKey>[], screenKey: TScreenKey, dialogKey?: TDialogKey) {
	let matches = routes.filter(route => route.screenKey === screenKey);
	if (!matches) {
		return null;
	}
	if (dialogKey != null) {
		matches = matches.filter(route => route.dialogKey === dialogKey);
	} else {
		matches = matches.filter(route => route.dialogKey == null);
	}
	if (matches.length === 1) {
		return matches[0];
	}
	return null;
}