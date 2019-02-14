import Page from './Page';

const config = {
	readWordRate: 100,
	idleReadRate: 500,
	pageOffsetUpdateRate: 3000,
	readStateCommitRate: 3000
};
interface Timers {
	readWord?: {
		handle?: number,
		rate?: number
	},
	updatePageOffset?: number,
	commitReadState?: number
}
export default class Reader {
	private _isReading = false;
	private _lastCommitPercentComplete = 0;
	private _page: Page | null;
	private readonly _readWord = () => {
		this.readWord();
	};
	private _timers: Timers = {
		readWord: { }
	};
	constructor(
		private readonly _onCommitReadState: (event: {
			isCompletionCommit: boolean,
			isRead: boolean,
			percentComplete: number,
			readStateArray: number[]
		}) => void
	) {
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
			percentComplete = readState.getPercentComplete(),
			isRead = percentComplete >= 90;
		this._onCommitReadState(
			{
				isCompletionCommit: this._lastCommitPercentComplete < 90 && isRead,
				isRead,
				percentComplete,
				readStateArray: readState.readStateArray
			}
		);
		this._lastCommitPercentComplete = percentComplete;
	}
	private readWord() {
		if (this._page.readWord()) {
			if (this._timers.readWord.rate === config.idleReadRate) {
				window.clearInterval(this._timers.readWord.handle);
				this._timers.readWord = {
					handle: window.setInterval(this._readWord, config.readWordRate),
					rate: config.readWordRate
				};
				this._timers.commitReadState = window.setInterval(
					() => {
						this.commitReadState();
					},
					config.readStateCommitRate
				);
			}
		} else if (this._page.isRead()) {
			this.stopReading();
			this.commitReadState();
		} else if (this._timers.readWord.rate === config.readWordRate) {
			window.clearInterval(this._timers.readWord.handle);
			this._timers.readWord = {
				handle: window.setInterval(this._readWord, config.idleReadRate),
				rate: config.idleReadRate
			};
			window.clearInterval(this._timers.commitReadState);
		}
	}
	private startReading() {
		if (!this._isReading && !this._page.isRead()) {
			this._timers.readWord = {
				handle: window.setInterval(this._readWord, config.idleReadRate),
				rate: config.idleReadRate
			};
			this._timers.updatePageOffset = window.setInterval(
				() => {
					this._page.updateOffset();
				},
				config.pageOffsetUpdateRate
			);
			this._isReading = true;
			this.readWord();
		}
	}
	private stopReading() {
		if (this._isReading) {
			window.clearTimeout(this._timers.readWord.handle);
			window.clearInterval(this._timers.updatePageOffset);
			window.clearInterval(this._timers.commitReadState);
			this._isReading = false;
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