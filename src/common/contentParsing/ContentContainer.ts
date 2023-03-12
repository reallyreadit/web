// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export default class ContentContainer {
	protected readonly _containerLineage: Node[] = [];
	protected readonly _contentLineages: Node[][] = [];
	constructor(containerLineage: Node[], contentLineages: Node[][]) {
		this._containerLineage = containerLineage;
		this._contentLineages = contentLineages;
	}
	public get containerElement() {
		return this._containerLineage.length
			? (this._containerLineage[this._containerLineage.length - 1] as Element)
			: null;
	}
	public get containerLineage() {
		return this._containerLineage as ReadonlyArray<Node>;
	}
	public get contentLineages() {
		return this._contentLineages as ReadonlyArray<ReadonlyArray<Node>>;
	}
}
