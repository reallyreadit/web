import MessagingContext, { Envelope } from './MessagingContext';

export default class IFrameMessagingContext extends MessagingContext {
	private readonly _messageListener = (message: MessageEvent) => {
		if (
			this._targetOrigin === '*' ||
			message.origin === this._targetOrigin
		) {
			this.processMessage(message.data);
		}
	};
	constructor(
		private readonly _targetWindow: Window,
		private readonly _targetOrigin: string
	) {
		super();
		window.addEventListener('message', this._messageListener);
	}
	protected postMessage(envelope: Envelope) {
		this._targetWindow.postMessage(
			envelope,
			this._targetOrigin
		);
	}
	public destruct() {
		window.removeEventListener('message', this._messageListener);
	}
} 