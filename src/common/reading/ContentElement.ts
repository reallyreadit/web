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
import Line from './Line';

export default class ContentElement {
    private _element: HTMLElement;
    private _lineHeight: number;
    private _wordCount: number;
    private _lines: Line[];
    private _contentOffset: {
        top: number,
        right: number,
        bottom: number,
        left: number
    };
    private _contentRect: {
        top: number,
        left: number,
        width: number,
        height: number
    };
    private _isDebugging = false;
    private _debugElements: HTMLElement[] = [];
    constructor(element: HTMLElement, wordCount: number) {
        // assign the element before executing any other methods
        this._element = element;
        // measure the element and then get the line height or use the element height
        this._contentOffset = this._getContentOffset();
        this._contentRect = this._getContentRect();
        this.setLineHeight();
        // assign the wordCount before calculating the lines
        this._wordCount = wordCount;
        // set the lines
        this._setLines(new ReadState([-this._wordCount]));
    }
    private _createListItemOrSpanElement() {
        let nodeName: 'li' | 'span';
        if (
            this._element.nodeName === 'OL' ||
            this._element.nodeName === 'UL'
        ) {
            nodeName = 'li';
        } else {
            nodeName = 'span';
        }
        return document.createElement(nodeName);
    }
    private isLineReadable(line: Line) {
        return this._contentRect.top + line.top >= window.pageYOffset &&
            this._contentRect.top + line.top <= window.innerHeight + window.pageYOffset &&
            !line.isRead();
    }
    private _setLines(readState: ReadState) {
        var lineCount = Math.max(1, Math.floor(this._contentRect.height / this._lineHeight)),
            minWordsPerLine = Math.floor(this._wordCount / lineCount),
            remainder = this._wordCount % lineCount;
        this._lines = [];
        for (var i = 0, wordCount = 0; i < lineCount; i++) {
            var lineWordCount = minWordsPerLine + (remainder > 0 ? remainder - --remainder : 0);
            this._lines.push(new Line(
                this._lineHeight * i,
                this._lineHeight,
                readState.slice(wordCount, lineWordCount)
            ));
            wordCount += lineWordCount;
        }
        this._syncDebugDisplay();
    }
    private _getContentOffset() {
        const computedStyle = window.getComputedStyle(this._element);
        const border = {
            top: parseInt(computedStyle.borderTopWidth),
            right: parseInt(computedStyle.borderRightWidth),
            bottom: parseInt(computedStyle.borderBottomWidth),
            left: parseInt(computedStyle.borderLeftWidth)
        };
        const padding = {
            top: parseInt(computedStyle.paddingTop),
            right: parseInt(computedStyle.paddingRight),
            bottom: parseInt(computedStyle.paddingBottom),
            left: parseInt(computedStyle.paddingLeft)
        };
        return {
            top: border.top + padding.top,
            right: border.right + padding.right,
            bottom: border.bottom + padding.bottom,
            left: border.left + padding.left
        };
    }
    private _getContentRect() {
        const rect = this._element.getBoundingClientRect();
        return {
            top: window.pageYOffset + rect.top + this._contentOffset.top,
            left: rect.left + this._contentOffset.left,
            width: rect.width - (this._contentOffset.left + this._contentOffset.right),
            height: rect.height - (this._contentOffset.top + this._contentOffset.bottom)
        };
    }
    private _syncDebugDisplay() {
        // check debug state
        if (!this._isDebugging) {
            return;
        }
        // sync the number of debug elements with the number of lines
        const
            lineCount = this._lines.length,
            debugElementCount = this._debugElements.length;
        if (lineCount > debugElementCount) {
            for (let i = 0; i < lineCount - debugElementCount; i++) {
                const newDebugElement = this._createListItemOrSpanElement();
                if (newDebugElement.nodeName === 'LI') {
                    newDebugElement.style.listStyle = 'none';
                }
                newDebugElement.style.position = 'absolute';
                newDebugElement.style.left = '0';
                newDebugElement.style.right = '0';
                newDebugElement.style.height = this._lineHeight + 'px';
                newDebugElement.style.boxShadow = 'inset 0 0 0 2px lime';
                this._element.appendChild(newDebugElement);
                this._debugElements.push(newDebugElement);
            }
        } else if (lineCount < debugElementCount) {
            const deleteCount = debugElementCount - lineCount;
            this._debugElements
                .splice(this._lines.length - deleteCount, deleteCount)
                .forEach(
                    deletedDebugElement => {
                        deletedDebugElement.remove();
                    }
                );
        }
        // set the backgrounds
        this._lines.forEach(
            (line, index) => {
                const
                    debugElement = this._debugElements[index],
                    percentComplete = line.readState.getPercentComplete();
                debugElement.style.top = line.top + 'px';
                debugElement.style.backgroundImage = `linear-gradient(to right, rgba(0, 255, 0, 0.5) ${percentComplete}%, transparent ${percentComplete}%)`;
            }
        );
    }
    public setLineHeight() {
        const testElement = this._createListItemOrSpanElement();
        if (testElement.nodeName === 'LI') {
            testElement.style.display = 'inline';
        }
        testElement.style.whiteSpace = 'pre';
        testElement.innerHTML = '&nbsp;\n&nbsp';
        this._element.appendChild(testElement);
        const clientRects = testElement.getClientRects();
        let lineHeight: number;
        if (clientRects.length) {
            lineHeight = clientRects[clientRects.length - 1].top - clientRects[0].top;
        }
        testElement.remove();
        this._lineHeight = lineHeight || this._contentRect.height || 1;
    }
    public updateOffset() {
        const contentRect = this._getContentRect();
        if (contentRect.top !== this._contentRect.top ||
            contentRect.left !== this._contentRect.left ||
            contentRect.width !== this._contentRect.width ||
            contentRect.height !== this._contentRect.height) {
                this._contentRect = contentRect;
                this._setLines(this.getReadState());
        }		
    }
    public toggleVisualDebugging() {
        if (this._isDebugging = !this._isDebugging) {
            this._element.style.position = 'relative';
            this._element.style.boxShadow = '0 0 0 2px green';
            this._debugElements.forEach(
                element => {
                    element.style.display = 'block';
                }
            );
            this._syncDebugDisplay();
        } else {
            this._element.style.boxShadow = '';
            this._debugElements.forEach(
                element => {
                    element.style.display = 'none';
                }
            );
        }
    }
    public isReadable() {
        return this._lines.some(line => this.isLineReadable(line));
    }
    public readWord() {
        const line = this._lines.find(line => this.isLineReadable(line));
        if (line) {
            const wordRead = line.readWord();
            if (wordRead) {
                this._syncDebugDisplay();
            }
            return wordRead;
        }
        return false;
    }
    public getReadState() {
        return new ReadState(this._lines.map(function (line) {
            return line.readState;
        }));
    }
    public setReadState(readState: ReadState) {
        this._setLines(readState);
    }
    public isRead() {
        return !this._lines.some(function (line) {
            return !line.isRead();
        });
    }
    public get element() {
        return this._element;
    }
    public get lines() {
        return this._lines;
    }
    public get offsetTop() {
        return this._contentRect.top;
    }
    public get wordCount() {
        return this._wordCount;
    }
}