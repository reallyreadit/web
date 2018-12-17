import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppRoot from '../common/components/AppRoot';
import ServerApi from './ServerApi';
import Captcha from './Captcha';
import ClientType from '../common/ClientType';
import BrowserRoot from '../common/components/BrowserRoot';
import BrowserApi from './BrowserApi';
import AppApi from './AppApi';
import ExtensionApi from './ExtensionApi';
import * as jsCookie from 'js-cookie';

// clean up localStorage
localStorage.removeItem('challenge');
localStorage.removeItem('newReplyNotification');
localStorage.removeItem('userAccount');

// clean up cookies
jsCookie.remove('hideHero');

ga('create', {
	trackingId: 'UA-101617933-1',
	cookieDomain: 'auto',
	userId: window.initData.userAccount ? window.initData.userAccount.id : null
});
ga('send', 'pageview');

const serverApi = new ServerApi(window.initData.serverApi);

const rootProps = {
	captcha: new Captcha(
		window.initData.captchaSiteKey,
		onLoadHandler => {
			window.onReCaptchaLoaded = () => {
				onLoadHandler(window.grecaptcha);
			};
		}
	),
	initialLocation: window.initData.initialLocation,
	initialUser: window.initData.userAccount,
	serverApi,
	version: window.initData.version,
	webServerEndpoint: window.initData.webServerEndpoint
};
let rootElement: React.ReactElement<any>;
switch (window.initData.clientType) {
	case ClientType.App:
		rootElement = React.createElement(
			AppRoot,
			{
				...rootProps,
				appApi: new AppApi()
			}
		);
		break;
	case ClientType.Browser:
		rootElement = React.createElement(
			BrowserRoot,
			{
				...rootProps,
				browserApi: new BrowserApi(),
				extensionApi: new ExtensionApi(window.initData.extensionId),
				newReplyNotification: window.initData.newReplyNotification
			}
		);
		break;
	default:
		throw new Error('Invalid clientType');
}

ReactDOM.hydrate(
	rootElement,
	document.getElementById('root')
);

serverApi.initialize();