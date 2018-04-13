import ReadState from './ReadState';
import ContentElement from './ContentElement';
import UserPage from '../../common/models/UserPage';

export default class Page {
	private _contentEls: ContentElement[];
	private _userPageId: number;
	private _wordCount: number;
	constructor(contentEls: Set<ContentElement>, showOverlay: boolean) {
		// set up the content elements
		this._contentEls = Array.from(contentEls).sort((a, b) => a.offsetTop - b.offsetTop);
		this._contentEls.forEach(el => el.showOverlay(showOverlay));
		// cache the word count
		this._wordCount = this.getReadState().wordCount;
	}
	private getReadState() {
		return new ReadState(this._contentEls.map(b => b.getReadState()));
	}
	private setReadState(readStateArray: number[]) {
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
	public initialize(userPage: UserPage) {
		this._userPageId = userPage.id;
		this.setReadState(userPage.readState);
	}
	public getReadStateCommitData() {
		return {
			userPageId: this._userPageId,
			readState: this.getReadState().readStateArray
		};
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
	public showOverlay(value: boolean) {
		this._contentEls.forEach(block => block.showOverlay(value));
	}
	public remove() {
		this._contentEls.forEach(block => block.showOverlay(false));
	}
	public get wordCount() {
		return this._wordCount;
	}
}