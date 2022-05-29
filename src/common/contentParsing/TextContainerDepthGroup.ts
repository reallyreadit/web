// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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