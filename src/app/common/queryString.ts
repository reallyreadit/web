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
			result[parts[0]] = parts[1];
			return result;
		}, {} as { [key: string]: string })
}
export function createQueryString(kvps: { [key: string]: string }) {
	let keys: string[];
	if (!kvps || !((keys = Object.keys(kvps)).length)) {
		return '';
	}
	return (
		'?' +
		keys
			.map(key => kvps[key] ? `${key}=${kvps[key]}` : key)
			.join('&')
	);
}
export const clientTypeKey = 'clientType';