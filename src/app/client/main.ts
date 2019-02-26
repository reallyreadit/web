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
import WebViewMessagingContext from '../../common/WebViewMessagingContext';

// clean up localStorage
localStorage.removeItem('challenge');
localStorage.removeItem('newReplyNotification');
localStorage.removeItem('userAccount');

// clean up cookies
jsCookie.remove('hideHero');

const initData = window.reallyreadit.app.initData;

ga('create', {
	trackingId: 'UA-101617933-1',
	cookieDomain: 'auto',
	userId: initData.userAccount ? initData.userAccount.id : null
});
ga('send', 'pageview');

const serverApi = new ServerApi(
	initData.apiServerEndpoint,
	initData.clientType,
	initData.version.toString(),
	initData.exchanges
);

const rootProps = {
	captcha: new Captcha(
		initData.captchaSiteKey,
		onLoadHandler => {
			window.onReCaptchaLoaded = () => {
				onLoadHandler(window.reallyreadit.app.grecaptcha);
			};
		}
	),
	initialLocation: initData.initialLocation,
	initialUser: initData.userAccount,
	serverApi,
	version: initData.version,
	webServerEndpoint: initData.webServerEndpoint
};
let rootElement: React.ReactElement<any>;
switch (initData.clientType) {
	case ClientType.App:
		const messagingContext = new WebViewMessagingContext();
		window.reallyreadit.app = {
			...window.reallyreadit.app,
			...messagingContext.createIncomingMessageHandlers()
		};
		rootElement = React.createElement(
			AppRoot,
			{
				...rootProps,
				appApi: new AppApi(messagingContext)
			}
		);
		break;
	case ClientType.Browser:
		rootElement = React.createElement(
			BrowserRoot,
			{
				...rootProps,
				browserApi: new BrowserApi(),
				extensionApi: new ExtensionApi(initData.extensionId),
				newReplyNotification: initData.newReplyNotification
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