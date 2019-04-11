import MessagingContext, { Envelope } from '../../../common/MessagingContext';

export default class IframeMessagingContext extends MessagingContext {
	private readonly _messageListener = (message: MessageEvent) => {
		if (message.origin === this._targetOrigin) {
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