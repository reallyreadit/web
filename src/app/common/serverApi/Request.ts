// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export function areEqual(a: Request, b: Request) {
	if (a.path !== b.path) {
		return false;
	}
	if (!a.data || !b.data) {
		return !a.data && !b.data;
	}
	if (Object.keys(a.data).length !== Object.keys(b.data).length) {
		return false;
	}
	for (let key in a.data) {
		if (!b.data.hasOwnProperty(key) || a.data[key] !== b.data[key]) {
			return false;
		}
	}
	return true;
}
export default interface Request {
	data?: { [key: string]: any };
	path: string;
}
