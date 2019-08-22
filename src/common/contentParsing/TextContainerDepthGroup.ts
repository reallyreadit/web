import TextContainer from './TextContainer';

export default class TextContainerDepthGroup {
	private readonly _depth: number;
	private readonly _members: TextContainer[];
	private _wordCount = 0;
	constructor(depth: number, ...members: TextContainer[]) {
		this._depth = depth;
		this._members = members;
		this._wordCount = members.reduce((sum, member) => sum += member.wordCount, 0);
	}
	public add(container: TextContainer) {
		// look for an existing member
		const member = this._members.find(member => member.containerElement === container.containerElement);
		if (member) {
			// merge content
			member.mergeContent(container);
		} else {
			// add a new member
			this._members.push(container);
		}
		// incrememnt the group word count
		this._wordCount += container.wordCount;
	}
	public get depth() {
		return this._depth;
	}
	public get members() {
		return this._members as ReadonlyArray<TextContainer>;
	}
	public get wordCount() {
		return this._wordCount;
	}
}