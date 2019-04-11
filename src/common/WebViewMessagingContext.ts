import MessagingContext, { Envelope } from './MessagingContext';

export interface IncomingMessageHandlers {
	postMessage: (jsonMessage: string) => void,
	sendResponse: (jsonCallbackResponse: string) => void
}
export default class WebViewMessagingContext extends MessagingContext {
	protected postMessage(envelope: Envelope) {
		window.webkit.messageHandlers.reallyreadit.postMessage(envelope);
	}
	public createIncomingMessageHandlers() {
		const processMessage = (jsonMessage: string) => {
			this.processMessage(JSON.parse(jsonMessage));
		};
		return {
			postMessage: (jsonMessage: string) => {
				processMessage(jsonMessage);
			},
			sendResponse: (jsonCallbackResponse: string) => {
				processMessage(jsonCallbackResponse);
			}
		};
	}
}