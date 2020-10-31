import ReadState from './ReadState';
import ContentElement from './ContentElement';
import Line from './Line';
import { getWordCount, isElement } from '../contentParsing/utils';
import TextContainer from '../contentParsing/TextContainer';

// it's important the count the words of each individual text node
// since that's how parseDocumentContent does it
function countTextNodeWords(element: Element) {
	let wordCount = 0;
	for (const childNode of element.childNodes) {
		if (childNode.nodeType === Node.TEXT_NODE) {
			wordCount += getWordCount(childNode);
		} else if (
			isElement(childNode)
		) {
			wordCount += countTextNodeWords(childNode);
		}
	}
	return wordCount;
}
function findContentElements(element: Element, contentElements: ContentElement[] = []) {
	let isContentElement = false;
	for (let child of element.childNodes) {
		if (
			child.nodeType === Node.TEXT_NODE &&
			child.textContent.trim().length
		) {
			isContentElement = true;
			break;
		}
	}
	if (isContentElement) {
		contentElements.push(
			new ContentElement(
				element as HTMLElement,
				countTextNodeWords(element)
			)
		);
	} else {
		for (let child of element.children) {
			findContentElements(child, contentElements);
		}
	}
	return contentElements;
}
export default class Page {
	private _contentEls: ContentElement[];
	constructor(primaryTextContainers: TextContainer[]) {
		// set up the content elements
		this._contentEls = primaryTextContainers
			.reduce<ContentElement[]>(
				(contentElements, textContainer) => contentElements.concat(
					findContentElements(textContainer.containerElement)
				),
				[]
			)
			.sort(
				(a, b) => a.offsetTop - b.offsetTop
			);
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
	public updateLineHeight() {
		this._contentEls.forEach(
			element => {
				element.setLineHeight();
			}
		);
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
	public getBookmarkScrollTop() {
		this.updateOffset();
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
			.find(
				line => line.readState.wordsRead > 0
			);
		if (lastReadLine) {
			return Math.max(
				0,
				(
					this._contentEls
						.find(
							paragraph => paragraph.lines.includes(lastReadLine)
						)
						.offsetTop +
					lastReadLine.top -
					window.innerHeight
				)
			);
		}
		return 0;
	}
	public toggleVisualDebugging() {
		this._contentEls.forEach(block => block.toggleVisualDebugging());
	}
	public get elements() {
		return this._contentEls;
	}
}