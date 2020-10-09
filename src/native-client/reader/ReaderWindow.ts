import { IncomingMessageHandlers } from '../../common/WebViewMessagingContext';
import HttpEndpoint from '../../common/HttpEndpoint';
import PackageVersionInfo from '../../common/PackageVersionInfo';

declare global {
	interface ReaderWindow extends IncomingMessageHandlers {
		config?: {
			version: PackageVersionInfo,
			webServer: HttpEndpoint
		}
	}
}