import { createQueryString } from "./routing/queryString";

const defaultPortConfigs = [
	{
		protocol: 'http',
		port: 80
	},
	{
		protocol: 'https',
		port: 443
	}
];
function prefixPath(path: string) {
	if (!path.startsWith('/')) {
		return '/' + path;
	}
	return path;
}
export function createUrl(endpoint: HttpEndpoint, path?: string, query?: { [key: string]: string }) {
	let url = endpoint.protocol + '://' + endpoint.host;
	if (endpoint.port != null) {
		const defaultPortConfig = defaultPortConfigs.filter(config => config.protocol === endpoint.protocol)[0];
		if (
			!defaultPortConfig ||
			defaultPortConfig.port !== endpoint.port
		) {
			url += (':' + endpoint.port);
		}
	}
	if (endpoint.path) {
		url += prefixPath(endpoint.path);
	}
	if (path) {
		url += prefixPath(path);
	}
	if (query) {
		url += createQueryString(query);
	}
	return url;
}
export default interface HttpEndpoint {
	protocol: string,
	host: string,
	port?: number,
	path?: string
}