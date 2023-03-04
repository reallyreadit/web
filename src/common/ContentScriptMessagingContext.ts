// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import MessagingContext, { Envelope } from './MessagingContext';

interface Contexts {
	localId: string;
	remoteId: string;
}
type ContentScriptEnvelope = Envelope & {
	localContextId: string;
	remoteContextId: string;
};
interface MessageEvent {
	data?: ContentScriptEnvelope;
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
			remoteContextId: this._contexts.remoteId,
		};
		window.postMessage(contentScriptEnvelope, '*');
	}
	public destruct() {
		window.removeEventListener('message', this._messageListener);
	}
}
