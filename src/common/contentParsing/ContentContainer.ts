export default class ContentContainer {
	protected readonly _containerLineage: Node[] = [];
	protected readonly _contentLineages: Node[][] = [];
	constructor(containerLineage: Node[], contentLineages: Node[][]) {
		this._containerLineage = containerLineage;
		this._contentLineages = contentLineages;
	}
	public get containerElement() {
		return (
			this._containerLineage.length ?
				this._containerLineage[this._containerLineage.length - 1] as Element :
				null
		);
	}
	public get containerLineage() {
		return this._containerLineage as ReadonlyArray<Node>;
	}
	public get contentLineages() {
		return this._contentLineages as ReadonlyArray<ReadonlyArray<Node>>;
	}
}