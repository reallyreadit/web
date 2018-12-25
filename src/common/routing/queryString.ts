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
export function createQueryString(kvps: { [key: string]: string }) {
	let keys: string[];
	if (!kvps || !((keys = Object.keys(kvps)).length)) {
		return '';
	}
	return (
		'?' +
		keys
			.map(key => kvps[key] ? `${encodeURIComponent(key)}=${encodeURIComponent(kvps[key])}` : encodeURIComponent(key))
			.join('&')
	);
}