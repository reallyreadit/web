// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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