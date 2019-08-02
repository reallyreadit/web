export default class TraversalPath {
	private readonly _hops: number;
	private readonly _frequency: number;
	private readonly _wordCount: number;
	constructor({
		hops,
		frequency,
		wordCount
	}: {
		hops: number,
		frequency: number,
		wordCount: number
	}) {
		this._hops = hops;
		this._frequency = frequency;
		this._wordCount = wordCount;
	}
	public add({ frequency, wordCount }: Pick<TraversalPath, 'frequency' | 'wordCount'>) {
		return new TraversalPath({
			hops: this._hops,
			frequency: this._frequency + frequency,
			wordCount: this._wordCount + wordCount
		});
	}
	public get frequency() {
		return this._frequency;
	}
	public get hops() {
		return this._hops;
	}
	public get wordCount() {
		return this._wordCount;
	}
}