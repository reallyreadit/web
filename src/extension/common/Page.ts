import ReadState from './ReadState';
import Block from './Block';
import templates from './templates';
import PageParams from './PageParams';

export default class Page {
    public static standardBlockSelectors =  ['p', 'blockquote', 'li'];
    public static getUrlId(param: string | Location | URL) {
        if (typeof param === 'string') {
            var url = new URL(param);
            return url.hostname + url.pathname;
        }
        return param.hostname + param.pathname;
    }
    private _urlId: string;
    private _blocks: Block[];
    private _pageNumber: number;
    private _pageLinks: string[];
    constructor(params: PageParams) {
        var overlayContainer = params.element.insertBefore(templates.overlayContainer, params.element.firstChild);
        this._urlId = Page.getUrlId(params.url);
        this._blocks = (Array.isArray(params.blockElements) ? params.blockElements : Array.from(params.blockElements))
            .map(function (blockElement) {
                return new Block(blockElement, overlayContainer.appendChild(templates.blockOverlay) as HTMLDivElement);
            })
            .sort(function (a, b) {
                return a.offsetTop - b.offsetTop;
            });
        this._pageNumber = params.number;
        this._pageLinks = params.pageLinks;
    }
    public setReadState(readState: ReadState) {
        // split the read state array over the block elements
        var wordCount = 0;
        this._blocks.forEach(function (block) {
            var wordsAvailable = readState.wordCount - wordCount;
            if (wordsAvailable >= block.wordCount) {
                block.setReadState(readState.slice(wordCount, block.wordCount));
            } else if (wordsAvailable > 0) {
                block.setReadState(new ReadState([readState.slice(wordCount, wordsAvailable), new ReadState([-(block.wordCount - wordsAvailable)])]));
            } else {
                block.setReadState(new ReadState([-block.wordCount]));
            }
            wordCount += block.wordCount;
        });
    }
    public getReadState() {
        return new ReadState(this._blocks.map(function (block) {
            return block.getReadState();
        }));
    }
    public updateOffset() {
        this._blocks.forEach(function (block) {
            block.updateOffset();
        });
    }
    public isRead() {
        return !this._blocks.some(function (block) {
            return !block.isRead();
        });
    }
    public readWord() {
        var block = this._blocks.filter(function (block) {
            return block.isReadable();
        })[0];
        if (block !== undefined) {
            // read word
            block.readWord();
        }
    }
    public get urlId() {
        return this._urlId;
    }
    public get number() {
        return this._pageNumber;
    }
    public get pageLinks() {
        return this._pageLinks;
    }
}