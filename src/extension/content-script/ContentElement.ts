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
    private _showOverlay: boolean;
    constructor(element: HTMLElement, wordCount: number) {
        // assign the element before executing any other methods
        this._element = element;
        // measure the element and then get the line height or use the element height
        this._contentOffset = this._getContentOffset();
        this._contentRect = this._getContentRect();
        this._lineHeight = this._getLineHeight() || this._contentRect.height || 1;
        // assign the wordCount before calculating the lines
        this._wordCount = wordCount;
        // set the lines
        this._setLines(new ReadState([-this._wordCount]));
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
    }
    private _getLineHeight() {
        const blankText = document.createElement('span');
        blankText.innerHTML = '&nbsp;';
        this._element.appendChild(blankText);
        const lineHeight = blankText.getBoundingClientRect().height;
        blankText.remove();
        return lineHeight;
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
    private _setBackgroundProgress() {
        const percentComplete = this.getReadState().getPercentComplete();
        this._element.style.backgroundImage = `linear-gradient(to right, pink ${percentComplete}%, transparent ${percentComplete}%)`;
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
    public showOverlay(value: boolean) {
        if (value) {
            this._element.style.boxShadow = 'inset 0 0 0 3px red';
            this._setBackgroundProgress();
        } else {
            this._element.style.boxShadow = '';
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
    public get element() {
        return this._element;
    }
    public get offsetTop() {
        return this._contentRect.top;
    }
    public get wordCount() {
        return this._wordCount;
    }
}