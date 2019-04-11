import { IncomingMessageHandlers } from '../../common/WebViewMessagingContext';
import HttpEndpoint from '../../common/HttpEndpoint';

declare global {
	interface ReaderWindow extends IncomingMessageHandlers {
		config?: {
			webServer: HttpEndpoint
		}
	}
}