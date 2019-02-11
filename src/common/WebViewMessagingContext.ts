type OnMessageListener = (data: any, messageSender: null, sendResponse: (data: any) => void) => void;
export interface IncomingMessageHandlers {
	postMessage: (jsonMessage: string) => void,
	sendResponse: (jsonCallbackResponse: string) => void
}
interface ResponseCallback {
	id: number,
	function: (data: any) => void
}
export default class WebViewMessagingContext {
	private readonly _onMessageListeners: OnMessageListener[] = [];
	private readonly _responseCallbacks: ResponseCallback[] = [];
	private postMessage(message: { data: any, callbackId: number | null } | { data: any, id: number }) {
		if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.reallyreadit) {
			window.webkit.messageHandlers.reallyreadit.postMessage(message);
		} else {
			window.postMessage('reallyreadit:' + JSON.stringify(message), '*');
		}
	}
	public addListener(listener: OnMessageListener) {
		this._onMessageListeners.push(listener);
	}
	public createIncomingMessageHandlers() {
		return {
			postMessage: (jsonMessage: string) => {
				const message = JSON.parse(jsonMessage);
				let sendResponse: (data: any) => void;
				if (message.callbackId != null) {
					sendResponse = response => {
						this.postMessage({
							id: message.callbackId,
							data: response
						});
					}
				} else {
					sendResponse = () => { };
				}
				this._onMessageListeners.forEach(listener => {
					listener(message.data, null, sendResponse);
				});
			},
			sendResponse: (jsonCallbackResponse: string) => {
				const callbackResponse = JSON.parse(jsonCallbackResponse);
				this._responseCallbacks
					.splice(
						this._responseCallbacks.findIndex(callback => callback.id === callbackResponse.id),
						1
					)[0]
					.function(callbackResponse.data);
			}
		};
	}
	public sendMessage(message: any, responseCallback?: (message: any) => void) {
		let callbackId: number | null = null;
		if (responseCallback) {
			this._responseCallbacks.push({
				id: callbackId = this._responseCallbacks.length ?
					Math.max(...this._responseCallbacks.map(callback => callback.id)) + 1 :
					0,
				function: responseCallback
			});
		}
		this.postMessage({ data: message, callbackId });
	}
}