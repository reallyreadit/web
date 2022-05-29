// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.


export enum ExtensionOptionKey {
	StarOnSave = 'extOptionStarOnSave'
}

export interface ExtensionOptions {
	[ExtensionOptionKey.StarOnSave]: boolean
}

// When querying the Storage API using key/value pairs default values can be specified.
export const extensionOptionsStorageQuery = {
	[ExtensionOptionKey.StarOnSave]: true
};