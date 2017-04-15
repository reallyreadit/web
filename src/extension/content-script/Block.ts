import ReadState from './ReadState';
import Line from './Line';
import Rect from './Rect';
import { getLineHeight, getContentRect } from './elementUtils';

export default class Block {
    private _element: HTMLElement;
    private _lineHeight: number;
    private _wordCount: number;
    private _lines: Line[];
    private _contentRect: Rect;
    private _showOverlay: boolean;
    constructor(element: HTMLElement, showOverlay: boolean) {
        // fields
        this._element = element;
        this._lineHeight = getLineHeight(element);
        this._wordCount = element.textContent.split(' ').length;
        this._lines = [];
        this._showOverlay = showOverlay;
        // init
        this._contentRect = getContentRect(element);
        this._setLines(new ReadState([-this._wordCount]));
        this.showOverlay(showOverlay);
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
            this._lines.splice(0, 1);
        }
        for (var i = 0, wordCount = 0; i < lineCount; i++) {
            var lineWordCount = minWordsPerLine + (remainder > 0 ? remainder - --remainder : 0);
            this._lines.push(new Line(
                this._lineHeight * i,
                this._lineHeight,
                readState.slice(wordCount, lineWordCount)
            ));
            wordCount += lineWordCount;
        }
    }
    private _setBackgroundProgress() {
        const percentComplete = this.getReadState().getPercentComplete();
        this._element.style.backgroundImage = `linear-gradient(to right, pink ${percentComplete}%, transparent ${percentComplete}%)`;
    }
    public updateOffset() {
        const contentRect = getContentRect(this._element);
        if (contentRect.top !== this._contentRect.top ||
            contentRect.left !== this._contentRect.left ||
            contentRect.width !== this._contentRect.width ||
            contentRect.height !== this._contentRect.height) {
                this._contentRect = contentRect;
                this._setLines(this.getReadState());
        }		
    }
    public showOverlay(value: boolean) {
        if (value) {
            this._element.style.outline = '3px dotted red';
            this._setBackgroundProgress();
        } else {
            this._element.style.outline = '';
            this._element.style.backgroundImage = '';
        }
        this._showOverlay = value;
    }
    public isReadable() {
        return this._lines.some(line => this.isLineReadable(line));
    }
    public readWord() {
        const line = this._lines.find(line => this.isLineReadable(line));
        if (line) {
            const wordRead = line.readWord();
            if (this._showOverlay && wordRead) {
                this._setBackgroundProgress();
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
        if (this._showOverlay) {
            this._setBackgroundProgress();
        }
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