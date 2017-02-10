import ReadState from './ReadState';
import Line from './Line';
import templates from './templates';
import Rect from './Rect';
import { getLineHeight, getContentRect } from './elementUtils';

export default class Block {
    private _element: Element;
    private _overlay: HTMLElement;
    private _lineHeight: number;
    private _wordCount: number;
    private _lines: Line[];
    private _contentRect: Rect;
    constructor(element: Element, overlay: HTMLElement, pageRect: Rect) {
        // fields
        this._element = element;
        this._overlay = overlay;
        this._lineHeight = getLineHeight(element);
        this._wordCount = element.textContent.split(' ').length;
        this._lines = [];
        // init
        this._contentRect = getContentRect(element);
        this._contentRect.top -= pageRect.top;
        this._contentRect.left -= pageRect.left;
        this._setLines(new ReadState([-this._wordCount]));
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
    public updateOffset(pageRect: Rect) {
        const contentRect = getContentRect(this._element);
        contentRect.top -= pageRect.top;
        contentRect.left -= pageRect.left;
        if (contentRect.top !== this._contentRect.top ||
            contentRect.left !== this._contentRect.left ||
            contentRect.width !== this._contentRect.width ||
            contentRect.height !== this._contentRect.height) {
                this._contentRect = contentRect;
                this._setLines(this.getReadState());
                this._setOverlayPosition();
        }		
    }
    public isReadable() {
        return this._lines.some(line => this.isLineReadable(line));
    }
    public readWord() {
        var line = this._lines.find(line => this.isLineReadable(line));
        if (line) {
            return line.readWord();
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
    public get offsetTop() {
        return this._contentRect.top;
    }
    public get wordCount() {
        return this._wordCount;
    }
}