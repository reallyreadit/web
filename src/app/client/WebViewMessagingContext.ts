export interface WebViewMessagingListeners {
	sendResponse: (jsonCallbackResponse: string) => void,
	postMessage: (jsonMessage: string) => void
}
type OnMessageListener = (data: any, messageSender: null, sendResponse: (data: any) => void) => void;
interface ResponseCallback {
	id: number,
	function: (data: any) => void
}
export default class {
	private readonly _onMessageListeners: OnMessageListener[] = [];
	private readonly _responseCallbacks: ResponseCallback[] = [];
	constructor() {
		window.reallyreadit = {
			sendResponse: (jsonCallbackResponse: string) => {
				const callbackResponse = JSON.parse(jsonCallbackResponse);
				this._responseCallbacks
					.splice(
						this._responseCallbacks.findIndex(callback => callback.id === callbackResponse.id),
						1
					)[0]
					.function(callbackResponse.data);
			},
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
					sendResponse = () => {};
				}
				this._onMessageListeners.forEach(listener => {
					listener(message.data, null, sendResponse);
				});
			}
		};
	}
	private postMessage(message: { data: any, callbackId: number | null } | { data: any, id: number }) {
		window.postMessage('reallyreadit:' + JSON.stringify(message), '*');
	}
	public addListener(listener: OnMessageListener) {
		this._onMessageListeners.push(listener);
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