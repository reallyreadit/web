import ContentContainer from './ContentContainer';

export default class TextContainer extends ContentContainer {
	private _wordCount: number;
	constructor(containerLineage: Node[], contentLineages: Node[][], wordcount: number) {
		super(containerLineage, contentLineages);
		this._wordCount = wordcount;
	}
	public mergeContent(container: TextContainer) {
		this._contentLineages.push(...container._contentLineages);
		this._wordCount += container.wordCount;
	}
	public get wordCount() {
		return this._wordCount;
	}
}