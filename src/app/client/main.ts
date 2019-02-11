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

ga('create', {
	trackingId: 'UA-101617933-1',
	cookieDomain: 'auto',
	userId: window.reallyreadit.app.initData.userAccount ? window.reallyreadit.app.initData.userAccount.id : null
});
ga('send', 'pageview');

const serverApi = new ServerApi(window.reallyreadit.app.initData.serverApi);

const rootProps = {
	captcha: new Captcha(
		window.reallyreadit.app.initData.captchaSiteKey,
		onLoadHandler => {
			window.reallyreadit.app.onReCaptchaLoaded = () => {
				onLoadHandler(window.reallyreadit.app.grecaptcha);
			};
		}
	),
	initialLocation: window.reallyreadit.app.initData.initialLocation,
	initialUser: window.reallyreadit.app.initData.userAccount,
	serverApi,
	version: window.reallyreadit.app.initData.version,
	webServerEndpoint: window.reallyreadit.app.initData.webServerEndpoint
};
let rootElement: React.ReactElement<any>;
switch (window.reallyreadit.app.initData.clientType) {
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
				extensionApi: new ExtensionApi(window.reallyreadit.app.initData.extensionId),
				newReplyNotification: window.reallyreadit.app.initData.newReplyNotification
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