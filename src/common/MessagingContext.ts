export interface Message {
	data?: any,
	type: string
}
interface CallEnvelope {
	callbackId?: number,
	data: any
}
interface ResponseEnvelope {
	data: any,
	id: number
}
export type Envelope = CallEnvelope | ResponseEnvelope;
type OnMessageListener = (message: Message, sendResponse: (data: any) => void) => void;
interface ResponseCallback {
	id: number,
	function: (data: any) => void
}
export default abstract class MessagingContext {
	private readonly _onMessageListeners: OnMessageListener[] = [];
	private readonly _responseCallbacks: ResponseCallback[] = [];
	private isResponseEnvelope(envelope: Envelope): envelope is ResponseEnvelope {
		return (envelope as ResponseEnvelope).id != null;
	}
	protected abstract postMessage(envelope: Envelope): void;
	protected processMessage(envelope: Envelope) {
		if (this.isResponseEnvelope(envelope)) {
			this._responseCallbacks
				.splice(
					this._responseCallbacks.findIndex(callback => callback.id === envelope.id),
					1
				)[0]
				.function(envelope.data);
		} else {
			let sendResponse: (data: any) => void;
			if (envelope.callbackId != null) {
				sendResponse = response => {
					this.postMessage({
						id: envelope.callbackId,
						data: response
					});
				}
			} else {
				sendResponse = () => { };
			}
			this._onMessageListeners.forEach(listener => {
				listener(envelope.data, sendResponse);
			});
		}
	}
	public addListener(listener: OnMessageListener) {
		this._onMessageListeners.push(listener);
	}
	public sendMessage(message: Message, responseCallback?: (data: any) => void) {
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