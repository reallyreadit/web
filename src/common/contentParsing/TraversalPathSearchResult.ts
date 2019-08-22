import TextContainer from './TextContainer';
import TraversalPath from './TraversalPath';

export default class TraversalPathSearchResult {
	private readonly _textContainer: TextContainer;
	private readonly _paths: TraversalPath[];
	private _preferredPath: TraversalPath;
	constructor(
		textContainer: TextContainer,
		paths: TraversalPath[]
	) {
		this._textContainer = textContainer;
		this._paths = paths;
	}
	public getPreferredPath() {
		if (!this._preferredPath) {
			this._preferredPath = this._paths.sort((a, b) => (
				a.wordCount !== b.wordCount ?
					b.wordCount - a.wordCount :
					a.hops - b.hops
			))[0];
		}
		return this._preferredPath;
	}
	public get textContainer() {
		return this._textContainer;
	}
}