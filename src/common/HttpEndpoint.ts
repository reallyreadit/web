// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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