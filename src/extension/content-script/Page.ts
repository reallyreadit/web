import ReadState from './ReadState';
import Block from './Block';
import templates from './templates';
import UserPage from '../common/UserPage';
import { getContentRect } from './elementUtils';
import Rect from './Rect';

export default class Page {
	private _element: Element;
	private _overlayContainer: HTMLElement;
	private _overlayContainerRect: Rect;
	private _blocks: Block[];
	private _userPageId: string;
	private _wordCount: number;
	constructor(element: Element, showOverlay: boolean) {
		// set up the blocks and overlays
		this._element = element;
		this._overlayContainer = templates.overlayContainer;
		if (!showOverlay) {
			this._overlayContainer.style.display = 'none';
		}
		element.insertBefore(this._overlayContainer, element.firstChild)
		this._overlayContainerRect = getContentRect(this._overlayContainer);
		// TODO: walk the tree and find elements with textContent !== ''
		this._blocks = Array
			.from(element.querySelectorAll('p,blockquote,li'))
			.filter(el => el.textContent)
			.map(blockEl => new Block(blockEl, this._overlayContainer.appendChild(templates.blockOverlay) as HTMLElement, this._overlayContainerRect))
			.sort((a, b) => a.offsetTop - b.offsetTop);
		// cache the word count
		this._wordCount = this.getReadState().wordCount;
	}
	private getReadState() {
		return new ReadState(this._blocks.map(b => b.getReadState()));
	}
	private setReadState(readStateArray: number[]) {
		// split the read state array over the block elements
		const readState = new ReadState(readStateArray);
		let wordCount = 0;
		this._blocks.forEach(function (block) {
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
		const overlayContainerRect = getContentRect(this._overlayContainer);
		if (
			overlayContainerRect.top != this._overlayContainerRect.top ||
			overlayContainerRect.left != this._overlayContainerRect.left ||
			overlayContainerRect.width != this._overlayContainerRect.width ||
			overlayContainerRect.height != this._overlayContainerRect.height
		) {
			this._overlayContainerRect = overlayContainerRect;
			this._blocks.forEach(block => block.updateOffset(overlayContainerRect));
		}
	}
	public isRead() {
		return !this._blocks.some(block => !block.isRead());
	}
	public readWord() {
		var block = this._blocks.find(block => block.isReadable());
		if (block) {
			return block.readWord();
		}
		return false;
	}
	public showOverlay(value: boolean) {
		if ((!this._overlayContainer.style.display && !value) || (this._overlayContainer.style.display === 'none' && value)) {
			this._overlayContainer.style.display = value ? '' : 'none';
			this.updateOffset();
		}
	}
	public remove() {
		this._overlayContainer.remove();
	}
	public get wordCount() {
		return this._wordCount;
	}
}