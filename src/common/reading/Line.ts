// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ReadState from './ReadState';

/**
 * Represents a line of text presented in the DOM to the user, whether it
 * is currently in the viewport or not. Also keeps metadata relavant to
 * reading simulation: how much of the line is read (ReadState), as well as methods to
 * read a word in this line.
 *
 * Note that this is an abstraction of a viewable line that is derived from
 * calculations based on the geometrical state of the viewport. The DOM itself
 * does not expose an interface to lines of text.
 *
 * @param top The top position of this line in pixels, relative to the parent
 * ContentElement that this line is a part of.
 * @param height the height of this line, i.e. the "line height" as it exists in the DOM.
 * @param readState the initial read state of this line.
 */
export default class Line {
    private _top: number;
    private _readState: ReadState;
    constructor(top: number, height: number, readState: ReadState) {
        // fields
        this._top = top;
        this._readState = readState;
    }
    public isRead() {
        return this._readState.isComplete();
    }
    public readWord() {
        const result = this._readState.readWord();
        return result;
    }
    public get readState() {
        return this._readState;
    }
    public get top() {
        return this._top;
    }
}