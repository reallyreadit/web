import ReadState from './ReadState';
import Line from './Line';
import templates from './templates';

interface Rect {
    top: number,
    left: number,
    width: number,
    height: number
}

function getLineHeight(block: Element) {
    var blankText = templates.blankText,
        lineHeight;
    block.appendChild(blankText);
    lineHeight = blankText.getBoundingClientRect().height;
    blankText.remove();
    return lineHeight;
}
function getContentRect(block: Element) {
    var computedStyle = getComputedStyle(block),
        border = {
            top: parseInt(computedStyle.borderTopWidth),
            right: parseInt(computedStyle.borderRightWidth),
            bottom: parseInt(computedStyle.borderBottomWidth),
            left: parseInt(computedStyle.borderLeftWidth)
        },
        padding = {
            top: parseInt(computedStyle.paddingTop),
            right: parseInt(computedStyle.paddingRight),
            bottom: parseInt(computedStyle.paddingBottom),
            left: parseInt(computedStyle.paddingLeft)
        },
        rect = block.getBoundingClientRect();
    return {
        top: window.pageYOffset + rect.top + border.top + padding.top,
        left: rect.left + border.left + padding.left,
        width: rect.width - border.left - padding.left - padding.right - border.right,
        height: rect.height - border.top - padding.top - padding.bottom - border.bottom
    };
}

export default class Block {
    private _element: Element;
    private _overlay: HTMLElement;
    private _lineHeight: number;
    private _wordCount: number;
    private _lines: Line[];
    private _contentRect: Rect;
    constructor(element: Element, overlay: HTMLElement, readStateDelegate?: (wordCount: number) => ReadState) {
        // fields
        this._element = element;
        this._overlay = overlay;
        this._lineHeight = getLineHeight(element);
        this._wordCount = element.textContent.split(' ').length;
        this._lines = [];
        // init
        this._contentRect = getContentRect(element);
        this._setLines(readStateDelegate !== undefined ? readStateDelegate(this._wordCount) : new ReadState([-this._wordCount]));
        this._setOverlayPosition();
    }
    private isLineReadable(line: Line) {
        return this._contentRect.top + line.top >= window.pageYOffset &&
            this._contentRect.top + line.top <= window.innerHeight + window.pageYOffset &&
            !line.isRead();
    }
    private _setLines(readState: ReadState) {
        var lineCount = Math.floor(this._contentRect.height / this._lineHeight),
            minWordsPerLine = Math.floor(this._wordCount / lineCount),
            remainder = this._wordCount % lineCount;
        while (this._lines.length > 0) {
            this._lines.splice(0, 1)[0].remove();
        }
        for (var i = 0, wordCount = 0; i < lineCount; i++) {
            var lineWordCount = minWordsPerLine + (remainder > 0 ? remainder - --remainder : 0);
            this._lines.push(new Line(
                this._lineHeight * i,
                this._lineHeight,
                this._overlay.appendChild(templates.lineOverlay) as HTMLElement,
                readState.slice(wordCount, lineWordCount)
            ));
            wordCount += lineWordCount;
        }
    }
    private _setOverlayPosition() {
        this._overlay.style.top = this._contentRect.top + 'px';
        this._overlay.style.left = this._contentRect.left + 'px';
        this._overlay.style.height = this._contentRect.height + 'px';
        this._overlay.style.width = this._contentRect.width + 'px';		
    }
    public updateOffset() {
        var contentRect = getContentRect(this._element);
        if (contentRect.top !== this._contentRect.top ||
            contentRect.left !== this._contentRect.left ||
            contentRect.width !== this._contentRect.width ||
            contentRect.height !== this._contentRect.height) {
                this._contentRect = contentRect;
                var readState = this.getReadState();
                this._setLines(readState);
                this._setOverlayPosition();
        }		
    }
    public isReadable() {
        return this._lines.some(line => this.isLineReadable(line));
    }
    public readWord() {
        var line = this._lines.filter(line => this.isLineReadable(line))[0];
        if (line !== undefined) {
            line.readWord();
        }
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
    public get offsetTop() {
        return this._contentRect.top;
    }
    public get wordCount() {
        return this._wordCount;
    }
}