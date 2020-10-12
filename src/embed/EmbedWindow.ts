import HttpEndpoint from '../common/HttpEndpoint';
import PackageVersionInfo from '../common/PackageVersionInfo';

declare global {
	interface EmbedWindow {
		config?: {
			apiServer: HttpEndpoint,
			staticServer: HttpEndpoint,
			twitterApiServer: HttpEndpoint,
			version: PackageVersionInfo,
			webServer: HttpEndpoint
		}
	}
}