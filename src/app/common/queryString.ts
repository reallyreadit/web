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
export function removeOptionalQueryStringParameters(path: string) {
	if (!path || !path.includes('?')) {
		return path;
	}
	const
		parts = path.split('?'),
		params = parseQueryString(parts[1]);
	if (params['mode']) {
		return parts[0] + '?mode=' + params['mode'];
	}
	return parts[0];
}