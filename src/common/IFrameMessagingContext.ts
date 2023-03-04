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

export default class IFrameMessagingContext extends MessagingContext {
	private readonly _messageListener = (message: MessageEvent) => {
		if (this._targetOrigin === '*' || message.origin === this._targetOrigin) {
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
		this._targetWindow.postMessage(envelope, this._targetOrigin);
	}
	public destruct() {
		window.removeEventListener('message', this._messageListener);
	}
}
