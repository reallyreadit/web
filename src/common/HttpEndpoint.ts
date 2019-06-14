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
	if (path) {
		if (!path.startsWith('/')) {
			url += '/';
		}
		url += path;
	}
	if (query) {
		url += createQueryString(query);
	}
	return url;
}
export default interface HttpEndpoint {
	protocol: string,
	host: string,
	port?: number
}