// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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
import { DeviceType } from '../../common/DeviceType';

const initData = window.reallyreadit.app.initData;

// Track whether we can reuse the server-rendered HTML or not.
let canHydrateDom = true;

// Check for iPadOS which is undetectable via the user-agent header.
if (
	initData.deviceType !== DeviceType.Ios &&
	navigator.platform === 'MacIntel' &&
	// This check is needed so that on a Mac, Android can be spoofed in a browser's responsive Dev Tools mode
	// The Mac platform will always be 'MacIntel', despite emulating an Android phone
	!navigator.userAgent.includes('Android') &&
	navigator.maxTouchPoints > 0
) {
	// Update the DeviceType.
	initData.deviceType = DeviceType.Ios;
	// Signal that we need to re-render instead of hydrate.
	canHydrateDom = false;
}

const serverApi = new ServerApi(
	initData.apiServerEndpoint,
	initData.clientType,
	initData.version.toString(),
	initData.deviceType,
	initData.exchanges
);

const rootProps = {
	captcha: new Captcha(null, (onLoadHandler) => {
		window.onReCaptchaLoaded = () => {
			onLoadHandler(window.grecaptcha);
		};
	}),
	initialLocation: {
		...initData.initialLocation,
		fragment: location.hash,
	},
	initialShowTrackingAnimationPrompt: initData.initialShowTrackingAnimationPrompt,
	initialUserProfile: initData.userProfile,
	serverApi,
	staticServerEndpoint: initData.staticServerEndpoint,
	version: new SemanticVersion(initData.version),
	webServerEndpoint: initData.webServerEndpoint,
};
let rootElement: React.ReactElement<any>;
switch (initData.clientType) {
	case ClientType.App:
		const messagingContext = new WebViewMessagingContext();
		window.reallyreadit.app = {
			...window.reallyreadit.app,
			...messagingContext.createIncomingMessageHandlers(),
		};
		rootElement = React.createElement(AppRoot, {
			...rootProps,
			appApi: new AppApi({
				messagingContext,
				platform: initData.appPlatform,
			}),
			appReferral: initData.appReferral,
		});
		break;
	case ClientType.Browser:
		rootElement = React.createElement(BrowserRoot, {
			...rootProps,
			browserApi: new BrowserApi(),
			deviceType: initData.deviceType,
			extensionApi: new ExtensionApi({
				installedVersion: initData.extensionVersion
					? new SemanticVersion(initData.extensionVersion)
					: null,
				webServerEndpoint: initData.webServerEndpoint,
			}),
		});
		break;
	default:
		throw new Error('Invalid clientType');
}

// Hydrate or render the root element.
const rootContainer = document.getElementById('root');
if (canHydrateDom) {
	ReactDOM.hydrate(rootElement, rootContainer);
} else {
	const emptyRootContainer = document.createElement('div');
	emptyRootContainer.id = 'root';
	rootContainer.replaceWith(emptyRootContainer);
	ReactDOM.render(rootElement, emptyRootContainer);
}

serverApi.initialize();

smoothscroll.polyfill();
