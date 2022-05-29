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