import { IncomingMessageHandlers } from '../../common/WebViewMessagingContext';

declare global {
	interface ReaderWindow extends IncomingMessageHandlers { }
}