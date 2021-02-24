import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppRoot from '../common/components/AppRoot';
import ServerApi from './ServerApi';
import Captcha from '../../common/captcha/Captcha';
import ClientType from '../common/ClientType';
import BrowserRoot from '../common/components/BrowserRoot';
import BrowserApi from '../../common/BrowserApi';
import AppApi from './AppApi';
import ExtensionApi from './ExtensionApi';
import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import * as smoothscroll from 'smoothscroll-polyfill';
import SemanticVersion from '../../common/SemanticVersion';
import { loadStripe } from '@stripe/stripe-js/pure';
import Lazy from '../../common/Lazy';

const initData = window.reallyreadit.app.initData;

const serverApi = new ServerApi(
	initData.apiServerEndpoint,
	initData.clientType,
	initData.version.toString(),
	initData.deviceType,
	initData.exchanges
);

const rootProps = {
	captcha: new Captcha(
		null,
		onLoadHandler => {
			window.onReCaptchaLoaded = () => {
				onLoadHandler(window.grecaptcha);
			};
		}
	),
	initialLocation: initData.initialLocation,
	initialUserProfile: initData.userProfile,
	serverApi,
	staticServerEndpoint: initData.staticServerEndpoint,
	stripeLoader: new Lazy(
		() => {
			loadStripe.setLoadParameters({
				advancedFraudSignals: false
			});
			return loadStripe(initData.stripePublishableKey);
		}
	),
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
				appApi: new AppApi(messagingContext),
				appReferral: initData.appReferral
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
				extensionApi: new ExtensionApi({
					installedVersion: (
						initData.extensionVersion ?
							new SemanticVersion(initData.extensionVersion) :
							null
					),
					webServerEndpoint: initData.webServerEndpoint
				})
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