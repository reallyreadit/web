// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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