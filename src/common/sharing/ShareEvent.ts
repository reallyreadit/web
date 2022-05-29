// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ShareData from './ShareData';

export interface ShareSelection {
	x: number,
	y: number,
	width: number,
	height: number
}

export interface ShareEvent extends ShareData {
	selection: ShareSelection
}

export function createRelativeShareSelection(selection: ShareSelection, window: Window) {
	return {
		x: selection.x / window.innerWidth,
		y: selection.y / window.innerHeight,
		width: selection.width / window.innerWidth,
		height: selection.height / window.innerHeight
	};
}