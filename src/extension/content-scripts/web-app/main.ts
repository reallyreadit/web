import ContentScriptMessagingContext from '../../../common/ContentScriptMessagingContext';
import { Message } from '../../../common/MessagingContext';

// ensure that we don't set up a duplicate context
if (!window.reallyreadit) {
	window.reallyreadit = { };

	const webApp = new ContentScriptMessagingContext({
		localId: 'com.readup.web.extension.content-scripts.web-app',
		remoteId: 'com.readup.web.app.client'
	});

	const handleMessageFromExtension = (message: Message) => {
		webApp.sendMessage(message);
	};

	const sendMessageToExtension = (message: Message) => {
		chrome.runtime.sendMessage({
			to: 'eventPage',
			from: 'webAppContentScript',
			type: message.type,
			data: message.data
		});
	};

	webApp.addListener(
		message => {
			// sendMessage will throw if this extension context is invalidated
			try {
				sendMessageToExtension(message);	
			} catch {
				chrome.runtime.onMessage.removeListener(handleMessageFromExtension);
				webApp.destruct();
			}
		}
	);

	chrome.runtime.onMessage.addListener(handleMessageFromExtension);

	webApp.sendMessage({
		type: 'initialize'
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