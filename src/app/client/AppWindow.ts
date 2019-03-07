import { IncomingMessageHandlers } from '../../common/WebViewMessagingContext';

declare global {
	interface AppWindow extends IncomingMessageHandlers { }
}