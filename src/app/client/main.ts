import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppRoot from '../common/components/AppRoot';
import ServerApi from './ServerApi';
import Captcha from './Captcha';
import ClientType from '../common/ClientType';
import BrowserRoot from '../common/components/BrowserRoot';
import LocalStorageApi from './LocalStorageApi';

ga('create', {
	trackingId: 'UA-101617933-1',
	cookieDomain: 'auto',
	userId: window.initData.userAccount ? window.initData.userAccount.id : null
});
ga('send', 'pageview');

const serverApi = new ServerApi(window.initData.serverApi);

const rootProps = {
	serverApi,
	captcha: new Captcha(
		window.initData.verifyCaptcha,
		onLoadHandler => {
			window.onReCaptchaLoaded = () => {
				onLoadHandler(grecaptcha);
			};
		}
	),
	initialLocation: window.initData.initialLocation,
	initialUser: window.initData.userAccount
};
let rootElement: React.ReactElement<any>;
switch (window.initData.clientType) {
	case ClientType.App:
		rootElement = React.createElement(
			AppRoot,
			rootProps
		);
		break;
	case ClientType.Browser:
		rootElement = React.createElement(
			BrowserRoot,
			{
				...rootProps,
				localStorageApi: new LocalStorageApi(),
				newReplyNotification: window.initData.newReplyNotification
			}
		);
		break;
	default:
		throw new Error('Invalid clientType');
}

ReactDOM.render(
	rootElement,
	document.getElementById('root')
);

serverApi.initialize();