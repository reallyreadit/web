import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppRoot from '../common/components/AppRoot';
import ServerApi from './ServerApi';
import Captcha from './Captcha';
import Environment from '../common/Environment';
import BrowserRoot from '../common/components/BrowserRoot';
import LocalStorageApi from './LocalStorageApi';

ga('create', {
	trackingId: 'UA-101617933-1',
	cookieDomain: 'auto',
	userId: window.initData.userAccount ? window.initData.userAccount.id : null
});
ga('send', 'pageview');

const serverApi = new ServerApi(window.initData.serverApi);

let rootElement: React.ReactElement<any>;
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
	path: window.location.pathname,
	user: window.initData.userAccount
};
if (window.initData.environment === Environment.App) {
	rootElement = React.createElement(
		AppRoot,
		rootProps
	);
} else {
	rootElement = React.createElement(
		BrowserRoot,
		{
			...rootProps,
			localStorage: new LocalStorageApi(),
			newReplyNotification: window.initData.newReplyNotification
		}
	);
}

ReactDOM.render(
	rootElement,
	document.getElementById('root')
);

serverApi.initialize();