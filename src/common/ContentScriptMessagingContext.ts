import MessagingContext, { Envelope } from './MessagingContext';

interface Contexts {
	localId: string,
	remoteId: string
}
type ContentScriptEnvelope = Envelope & {
	localContextId: string,
	remoteContextId: string
};
interface MessageEvent {
	data?: ContentScriptEnvelope
}
export default class ContentScriptMessagingContext extends MessagingContext {
	private readonly _contexts: Contexts;
	private readonly _messageListener = (message: MessageEvent) => {
		if (message.data?.localContextId === this._contexts.remoteId) {
			this.processMessage(message.data);
		}
	};
	constructor(contexts: Contexts) {
		super();
		this._contexts = contexts;
		window.addEventListener('message', this._messageListener);
	}
	protected postMessage(envelope: Envelope) {
		const contentScriptEnvelope: ContentScriptEnvelope = {
			...envelope,
			localContextId: this._contexts.localId,
			remoteContextId: this._contexts.remoteId
		};
		window.postMessage(contentScriptEnvelope, '*');
	}
	public destruct() {
		window.removeEventListener('message', this._messageListener);
	}
}