// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import Page from './Page';

interface CommitEvent {
	isCompletionCommit: boolean,
	isRead: boolean,
	percentComplete: number,
	readStateArray: number[]
}
export default class Reader {
	private _commitInterval: number | null;
	private _isReading = false;
	private _lastCommitPercentComplete = 0;
	private _lastReadTimestamp: number | null;
	private _offsetUpdateInterval: number | null;
	private readonly _onCommitReadState: (event: CommitEvent) => void;
	private _page: Page | null;
	private readonly _read = () => {
		if (this._isReading) {
			const
				now = Date.now(),
				elapsed = now - (this._lastReadTimestamp || now - 300),
				readWordCount = Math.floor(elapsed / 100);
			for (let i = 0; i < readWordCount; i++) {
				if (!this._page.readWord() && this._page.isRead()) {
					this.stopReading();
					this.commitReadState();
					return;
				}
			}
			this._lastReadTimestamp = now;
			window.setTimeout(this._read, 300);
		}
	};
	constructor(onCommitReadState: (event: CommitEvent) => void) {
		this._onCommitReadState = onCommitReadState;
		window.document.addEventListener('visibilitychange', () => {
			if (this._page) {
				if (window.document.hidden) {
					this.stopReading();
				} else {
					this.startReading();
				}
			}
		});
	}
	private commitReadState() {
		const
			readState = this._page.getReadState(),
			percentComplete = readState.getPercentComplete();
		if (percentComplete > this._lastCommitPercentComplete) {
			const isRead = percentComplete >= 90;
			this._onCommitReadState({
				isCompletionCommit: this._lastCommitPercentComplete < 90 && isRead,
				isRead,
				percentComplete,
				readStateArray: readState.readStateArray
			});
			this._lastCommitPercentComplete = percentComplete;
		}
	}
	private startReading() {
		if (!this._isReading && !this._page.isRead()) {
			this._isReading = true;
			this._commitInterval = window.setInterval(
				() => {
					this.commitReadState();
				},
				3000
			);
			this._offsetUpdateInterval = window.setInterval(
				() => {
					this._page.updateOffset();
				},
				3000
			);
			this._read();
		}
	}
	private stopReading() {
		if (this._isReading) {
			this._isReading = false;
			this._lastReadTimestamp = null;
			window.clearInterval(this._commitInterval);
			window.clearInterval(this._offsetUpdateInterval);
		}
	}
	public loadPage(page: Page) {
		this._page = page;
		if (window.document.visibilityState === 'visible') {
			this.startReading();
		}
	}
	public unloadPage() {
		this.stopReading();
		this._page = null;
		this._lastCommitPercentComplete = 0;
	}
}