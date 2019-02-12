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
export function createUrl(endpoint: HttpEndpoint, path: string | null = null) {
	let url = endpoint.protocol + '://' + endpoint.host;
	const defaultPortConfig = defaultPortConfigs.filter(config => config.protocol === endpoint.protocol)[0];
	if (defaultPortConfig && defaultPortConfig.port !== endpoint.port) {
		url += (':' + endpoint.port);
	}
	if (path) {
		if (!path.startsWith('/')) {
			url += '/';
		}
		url += path;
	}
	return url;
}
export default interface HttpEndpoint {
	protocol: string,
	host: string,
	port: number
}