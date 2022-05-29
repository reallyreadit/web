// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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
	private _callbackId = 1;
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
				id: callbackId = this._callbackId++,
				function: responseCallback
			});
		}
		this.postMessage({ data: message, callbackId });
	}
}