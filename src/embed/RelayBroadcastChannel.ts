import { BroadcastEventListener } from '../common/BrowserApi';

export default class RelayBroadcastChannel {
	private readonly _listeners: BroadcastEventListener[] = [];
	private readonly _onMessagePosted: BroadcastEventListener;
	constructor(
		{
			onMessagePosted
		}:
			{
				onMessagePosted: BroadcastEventListener
			}
	) {
		this._onMessagePosted = onMessagePosted;
	}
	public addEventListener(listener: BroadcastEventListener) {
		this._listeners.push(listener);
	}
	public postMessage(data: any) {
		this._onMessagePosted(data);
	}
	public relayMessage(messageData: any) {
		this._listeners.forEach(
			listener => {
				listener(messageData);
			}
		);
	}
}