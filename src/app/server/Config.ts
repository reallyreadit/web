import HttpEndpoint from '../../common/HttpEndpoint';

export interface Config {
	apiServer: HttpEndpoint,
	chromeExtensionId: string,
	contentRootPath: string,
	cookieDomain: string,
	cookieName: string,
	logStream?: {
		type: string,
		path: string,
		period: string,
		count: number,
		level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
	},
	packageFilePath: string,
	port?: number | string,
	secureCookie: boolean,
	serveStaticContent: boolean,
	staticServer: HttpEndpoint,
	stripePublishableKey: string,
	webServer: HttpEndpoint
}