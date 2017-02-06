import ReadState from './ReadState';
import Block from './Block';
import templates from './templates';

export default class Page {
    private _blocks: Block[];
    private _userPageId: string;
    constructor(element: Element) {
        // set up the blocks and overlay
        const overlayContainer = templates.overlayContainer;
        // TODO: walk the tree and find elements with textContent !== ''
        this._blocks = Array.from(element.querySelectorAll('p,blockquote,li'))
            .map(el => new Block(el, overlayContainer.appendChild(templates.blockOverlay) as HTMLDivElement))
            .sort((a, b) => a.offsetTop - b.offsetTop);
        element.insertBefore(overlayContainer, element.firstChild);
    }
    public setReadState(readStateArray: number[]) {
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
    public getReadState() {
        return new ReadState(this._blocks.map(b => b.getReadState()));
    }
    public setUserPageId(id: string) {
        this._userPageId = id;
        return this;
    }
    public getUserPageId() {
        return this._userPageId;
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
}