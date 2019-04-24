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
import * as smoothscroll from 'smoothscroll-polyfill';
import SemanticVersion from '../../common/SemanticVersion';

// clean up localStorage
localStorage.removeItem('challenge');
localStorage.removeItem('newReplyNotification');
localStorage.removeItem('userAccount');

// clean up cookies
jsCookie.remove('hideHero');
jsCookie.remove('_ga');
jsCookie.remove('_gat');
jsCookie.remove('_gid');

const initData = window.reallyreadit.app.initData;

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
				onLoadHandler(window.grecaptcha);
			};
		}
	),
	initialLocation: initData.initialLocation,
	initialUser: initData.userAccount,
	serverApi,
	version: new SemanticVersion(initData.version),
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
				deviceType: initData.deviceType,
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

smoothscroll.polyfill();