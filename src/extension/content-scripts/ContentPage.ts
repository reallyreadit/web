import ReadState from './ReadState';
import Block from './Block';
import templates from './templates';
import ContentPageMetadata from './ContentPageMetadata';
import ContentPageData from '../common/ContentPageData';
import Source from '../common/Source';

export default class ContentPage {
    private static createSlug(title: string, sourceSlug: string) {
        const slug = sourceSlug + '_' + title.replace(/[^a-zA-Z0-9-\s]/g, '').replace(/\s/g, '-').toLowerCase();
        return slug.length > 80 ? slug.substr(0, 80) : slug;
    }
    private _metadata: ContentPageMetadata;
    private _source: Source;
    private _blocks: Block[];
    private _slug: string;
    constructor(metadata: ContentPageMetadata, source: Source) {
        this._metadata = metadata;
        this._source = source;
        // set up the blocks and overlay
        const overlayContainer = templates.overlayContainer;
        // TODO: walk the tree and find elements with textContent !== ''
        this._blocks = Array.from(metadata.element.querySelectorAll('p,blockquote,li'))
            .map(el => new Block(el, overlayContainer.appendChild(templates.blockOverlay) as HTMLDivElement))
            .sort((a, b) => a.offsetTop - b.offsetTop);
        metadata.element.insertBefore(overlayContainer, metadata.element.firstChild);
        // create a slug
        this._slug = ContentPage.createSlug(metadata.title, source.slug);
    }
    private setReadState(readState: ReadState) {
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
    private getReadState() {
        return new ReadState(this._blocks.map(b => b.getReadState()));
    }
    public update(data: ContentPageData) {
        this.setReadState(new ReadState(data.readState));
    }
    public serialize() {
        const readState = this.getReadState();
        return {
            slug: this._slug,
            title: this._metadata.title,
            wordCount: this._blocks.reduce((sum, block) => sum += block.wordCount, 0),
            readState: readState.readStateArray,
            percentComplete: readState.getPercentComplete(),
            url: this._metadata.url,
            datePublished: this._metadata.datePublished,
            author: this._metadata.author,
            pageNumber: this._metadata.pageNumber,
            pageLinks: this._metadata.pageLinks,
            sourceId: this._source.id
        };
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
    public get slug() {
        return this._slug;
    }
}