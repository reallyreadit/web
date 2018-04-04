type OnMessageListener = (data: any) => void;
export interface AppApi {
	sendResponse: (jsonCallbackResponse: string) => void,
	postMessage: (jsonMessage: string) => void
}
interface ResponseCallback {
	id: number,
	function: OnMessageListener
}
export default class {
	private _responseCallbackId = 0;
	private readonly _responseCallbacks: ResponseCallback[] = [];
	private readonly _onMessageListeners: OnMessageListener[] = [];
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
				this._onMessageListeners.forEach(listener => listener(JSON.parse(jsonMessage)));
			}
		};
	}
	public addListener(listener: OnMessageListener) {
		this._onMessageListeners.push(listener);
	}
	public sendMessage(message: {}): void;
	public sendMessage(message: {}, responseCallback: OnMessageListener | null = null) {
		let callbackId: number | null = null;
		if (responseCallback) {
			this._responseCallbacks.push({
				id: (callbackId = this._responseCallbackId++),
				function: responseCallback
			});
		}
		window.postMessage(JSON.stringify({ data: message, callbackId }), '*');
	}
}