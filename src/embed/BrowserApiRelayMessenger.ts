import { MessageListener } from '../common/BrowserApi';

export default class BrowserApiRelayMessenger {
	private readonly _listeners: MessageListener[] = [];
	private readonly _onMessagePosted: MessageListener;
	constructor(
		{
			onMessagePosted
		}:
		{
			onMessagePosted: MessageListener
		}
	) {
		this._onMessagePosted = onMessagePosted;
	}
	public addListener(listener: MessageListener) {
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