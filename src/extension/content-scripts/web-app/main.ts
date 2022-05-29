// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ContentScriptMessagingContext from '../../../common/ContentScriptMessagingContext';
import { Message } from '../../../common/MessagingContext';

// ensure that we don't set up a duplicate context
if (!window.reallyreadit) {
	window.reallyreadit = { };

	const webApp = new ContentScriptMessagingContext({
		localId: 'com.readup.web.extension.content-scripts.web-app',
		remoteId: 'com.readup.web.app.client'
	});

	const handleMessageFromExtension = (message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
		webApp.sendMessage(message);
		// always send a response because the sender must use a callback in order to
		// check for runtime errors and an error will be triggered if the port is closed
		sendResponse();
	};

	const sendMessageToExtension = (message: Message) => {
		// sendMessage will throw if this extension context is invalidated
		try {
			chrome.runtime.sendMessage({
				to: 'eventPage',
				from: 'webAppContentScript',
				type: message.type,
				data: message.data
			});
		} catch {
			chrome.runtime.onMessage.removeListener(handleMessageFromExtension);
			webApp.destruct();
		}
	};

	webApp.addListener(sendMessageToExtension);

	chrome.runtime.onMessage.addListener(handleMessageFromExtension);

	webApp.sendMessage({
		type: 'initialize',
		data: {
			version: chrome.runtime.getManifest().version
		}
	});

	sendMessageToExtension({
		type: 'registerPage'
	});

	window.addEventListener(
		'unload',
		() => {
			sendMessageToExtension({
				type: 'unregisterPage'
			});
		}
	);
}