import ReadState from './ReadState';
import ContentElement from './ContentElement';
import Line from './Line';

export default class Page {
	private _contentEls: ContentElement[];
	constructor(contentEls: ContentElement[], showOverlay: boolean) {
		// set up the content elements
		this._contentEls = contentEls.sort((a, b) => a.offsetTop - b.offsetTop);
		this._contentEls.forEach(el => el.showOverlay(showOverlay));
	}
	public setReadState(readStateArray: number[]) {
		// split the read state array over the block elements
		const readState = new ReadState(readStateArray);
		let wordCount = 0;
		this._contentEls.forEach(function (block) {
			const wordsAvailable = readState.wordCount - wordCount;
			if (wordsAvailable >= block.wordCount) {
				block.setReadState(readState.slice(wordCount, block.wordCount));
			} else if (wordsAvailable > 0) {
				block.setReadState(new ReadState([readState.slice(wordCount, wordsAvailable), new ReadState([-(block.wordCount - wordsAvailable)])]));
			} else {
				block.setReadState(new ReadState([-block.wordCount]));
			}
			wordCount += block.wordCount;
		});
		return this;
	}
	public getReadState() {
		return new ReadState(this._contentEls.map(b => b.getReadState()));
	}
	public updateOffset() {
		this._contentEls.forEach(block => block.updateOffset());
	}
	public isRead() {
		return !this._contentEls.some(block => !block.isRead());
	}
	public readWord() {
		var block = this._contentEls.find(block => block.isReadable());
		if (block) {
			return block.readWord();
		}
		return false;
	}
	public scrollWindowToResumeReading() {
		const readState = this.getReadState();
		const lastReadLine = this._contentEls
			.reduce(
				(lines, paragraph) => lines.concat(paragraph.lines),
				[] as Line[]
			)
			.reduce(
				(searchableLines, line) => {
					if (searchableLines.reduce((sum, line) => sum + line.readState.wordCount, 0) < readState.wordsRead) {
						return searchableLines.concat(line);
					}
					return searchableLines;
				},
				[] as Line[]
			)
			.reverse()
			.find(line => line.readState.wordsRead > 0);
		if (lastReadLine) {
			window.scrollTo({
				behavior: 'smooth',
				top: Math.max(
					0,
					(
						this._contentEls.find(paragraph => paragraph.lines.includes(lastReadLine)).offsetTop +
						lastReadLine.top -
						(window.innerHeight * 0.25)
					)
				)
			});
		}
	}
	public showOverlay(value: boolean) {
		this._contentEls.forEach(block => block.showOverlay(value));
	}
	public remove() {
		this._contentEls.forEach(block => block.showOverlay(false));
	}
	public get elements() {
		return this._contentEls;
	}
}