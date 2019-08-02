import ContentContainer from './ContentContainer';

export default class ImageContainer extends ContentContainer {
	private readonly _caption: string | null;
	private readonly _credit: string | null;
	constructor(containerLineage: Node[], contentLineages: Node[][], caption: string | null, credit: string | null) {
		super(containerLineage, contentLineages);
		this._caption = caption;
		this._credit = credit;
	}
	public get caption() {
		return this._caption;
	}
	public get credit() {
		return this._credit;
	}
}