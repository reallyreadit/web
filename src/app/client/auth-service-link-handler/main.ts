import BrowserApi from '../BrowserApi';
import ExtensionApi from '../ExtensionApi';
import { parseQueryString } from '../../../common/routing/queryString';
import { AuthServiceBrowserLinkResponse } from '../../../common/models/auth/AuthServiceBrowserLinkResponse';

const response = JSON.parse(parseQueryString(window.location.search)['body']) as AuthServiceBrowserLinkResponse;
new BrowserApi()
	.authServiceLinkCompleted(response);
new ExtensionApi({
		legacyChromeExtensionId: '',
		isInstalled: true
	})
	.authServiceLinkCompleted(response);