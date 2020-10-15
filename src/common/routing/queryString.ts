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
						typeof value === 'number'
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
export const appReferralQueryStringKey = 'appReferral';
export const authServiceTokenQueryStringKey = 'authServiceToken';
export const clientTypeQueryStringKey = 'clientType';
export const extensionAuthQueryStringKey = 'extensionAuth';
export const extensionInstalledQueryStringKey = 'extensionInstalled';
export const messageQueryStringKey = 'message';
// legacy
export const marketingScreenVariantQueryStringKey = 'marketingScreenVariant';
export const marketingVariantQueryStringKey = 'marketingVariant';
export const referrerUrlQueryStringKey = 'referrerUrl';
export const unroutableQueryStringKeys = [
	appReferralQueryStringKey,
	authServiceTokenQueryStringKey,
	clientTypeQueryStringKey,
	extensionAuthQueryStringKey,
	extensionInstalledQueryStringKey,
	messageQueryStringKey,
	// legacy
	marketingScreenVariantQueryStringKey,
	marketingVariantQueryStringKey,
	referrerUrlQueryStringKey
];