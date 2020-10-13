import { BroadcastChannelMessenger } from '../../common/BrowserApi';
import IFrameMessagingContext from '../../common/IFrameMessagingContext';

const iframeMessaging = new IFrameMessagingContext(window.parent, '*');
iframeMessaging.addListener(
	message => {
		switch (message.type) {
			case 'browser':
				browserApiMessenger.postMessage(message.data);
				break;
		}
	}
);

const browserApiMessenger = new BroadcastChannelMessenger();
browserApiMessenger.addListener(
	messageData => {
		iframeMessaging.sendMessage({
			type: 'browser',
			data: messageData
		});
	}
);