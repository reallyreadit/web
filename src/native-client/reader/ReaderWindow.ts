import { IncomingMessageHandlers } from '../../common/WebViewMessagingContext';
import HttpEndpoint from '../../common/HttpEndpoint';
import PackageVersionInfo from '../../common/PackageVersionInfo';
import { AppPlatform } from '../../common/AppPlatform';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';

declare global {
	interface ReaderWindow extends IncomingMessageHandlers {
		config: {
			version: PackageVersionInfo,
			staticServer: HttpEndpoint,
			webServer: HttpEndpoint
		},
		initData: {
			appPlatform: AppPlatform,
			appVersion: string,
			displayPreference: DisplayPreference
		}
	}
}