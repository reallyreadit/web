// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export function parseQueryString(queryString: string) {
	if (!queryString) {
		return {} as { [key: string]: string };
	}
	if (queryString.startsWith('?')) {
		queryString = queryString.substring(1);
	}
	return queryString
		.split('&')
		.reduce((result, param) => {
			const parts = param.split('=');
			result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
			return result;
		}, {} as { [key: string]: string })
}
export function createQueryString(kvps: { [key: string]: string | Array<string> }) {
	if (kvps) {
		const qsKvps = Object
			.keys(kvps)
			.reduce<string[]>(
				(qsKvps, key) => {
					const
						qsKey = encodeURIComponent(key),
						value = kvps[key];
					if (value == null) {
						qsKvps.push(qsKey);
					} else if (
						typeof value === 'string' ||
						typeof value === 'number' ||
						typeof value === 'boolean'
					) {
						qsKvps.push(qsKey + '=' + encodeURIComponent(value));
					} else if (Array.isArray(value)) {
						value.forEach(
							item => {
								qsKvps.push(qsKey + '=' + encodeURIComponent(item));
							}
						);
					}
					return qsKvps;
				},
				[]
			);
		if (qsKvps.length) {
			return '?' + qsKvps.join('&');
		}
	}
	return '';
}
export const appPlatformQueryStringKey = 'appPlatform';
export const appReferralQueryStringKey = 'appReferral';
export const appVersion = 'appVersion';
export const authServiceTokenQueryStringKey = 'authServiceToken';
export const clientTypeQueryStringKey = 'clientType';
export const deviceTypeQueryStringKey = 'deviceType';
export const extensionAuthQueryStringKey = 'extensionAuth';
export const extensionInstalledQueryStringKey = 'extensionInstalled';
export const messageQueryStringKey = 'message';
export const subscribeQueryStringKey = 'subscribe';
// legacy
export const marketingScreenVariantQueryStringKey = 'marketingScreenVariant';
export const marketingVariantQueryStringKey = 'marketingVariant';
export const referrerUrlQueryStringKey = 'referrerUrl';
export const unroutableQueryStringKeys = [
	appPlatformQueryStringKey,
	appReferralQueryStringKey,
	appVersion,
	authServiceTokenQueryStringKey,
	clientTypeQueryStringKey,
	deviceTypeQueryStringKey,
	extensionAuthQueryStringKey,
	extensionInstalledQueryStringKey,
	messageQueryStringKey,
	subscribeQueryStringKey,
	// legacy
	marketingScreenVariantQueryStringKey,
	marketingVariantQueryStringKey,
	referrerUrlQueryStringKey
];