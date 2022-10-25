// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ReadState from './ReadState';
import ContentElement from './ContentElement';
import Line from './Line';
import { getWordCount, isBlockElement, isElement } from '../contentParsing/utils';
import TextContainer from '../contentParsing/TextContainer';

/**
 * Recursively counts and sums the number of words in the DOM Text Nodes
 * that are descendants of the given Element.
 */
function countTextNodeWords(element: Element): number {
	// It's important the count the words of each individual text node
	// since that's how parseDocumentContent does it.
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

/**
 * Recursively analyzes the descendant elements of the given DOM Element (including
 * the element itself), then finds Elements that qualify as elements with potentially relevant
 * content. These are wrapped inside ContentElement classes and returned as a list that
 * flattens the original DOM hierarchy of the elements.
 */
function findContentElements(element: Element, contentElements: ContentElement[] = []): ContentElement[] {
	let
		containsTextNodeContent = false,
		containsBlockElement = false;
	for (let child of element.childNodes) {
		if (
			child.nodeType === Node.TEXT_NODE &&
			child.textContent.trim().length
		) {
			containsTextNodeContent = true;
		} else if (
			isBlockElement(child)
		) {
			containsBlockElement = true;
		}
	}
	if (containsTextNodeContent || !containsBlockElement) {
	// If the given element contains least one non-empty text node, OR does not
	// contain any node that is a traditional block-level element, is assumed
	// to be a piece of relevant content. We process it as a single ContentElement.
		contentElements.push(
			new ContentElement(
				element as HTMLElement,
				countTextNodeWords(element)
			)
		);
	} else {
		// If at least one traditional block-level element was present in the child nodes,
		// and no Text Nodes, then we recursively find the ContentElements descending
		// from each block-level child element and add them to the list of contentElements.
		for (let child of element.children) {
			findContentElements(child, contentElements);
		}
	}
	return contentElements;
}
/**
 * Represents a web page containing an article, or a part of an article.
 * Interfaces with the web page via the DOM, through the primary TextContainer
 * DOM Element wrappers passed into the construtor.
 * Also represents the reading progress of the reader in this DOM page.
 */
export default class Page {
	private _contentEls: ContentElement[];
	constructor(primaryTextContainers: TextContainer[]) {
		// Set up the content elements. Flatten the list of TextContainers
		// into a larger list of the content
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