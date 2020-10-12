import { BrowserBroadcastChannel } from '../../common/BrowserApi';
import IFrameMessagingContext from '../../common/IFrameMessagingContext';

const iframeMessaging = new IFrameMessagingContext(window.parent, '*');
iframeMessaging.addListener(
	message => {
		switch (message.type) {
			case 'browser':
				browserBroadcastChannel.postMessage(message.data);
				break;
		}
	}
);

const browserBroadcastChannel = new BrowserBroadcastChannel();
browserBroadcastChannel.addEventListener(
	messageData => {
		iframeMessaging.sendMessage({
			type: 'browser',
			data: messageData
		});
	}
);