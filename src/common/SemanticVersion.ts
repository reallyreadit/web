// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export default class SemanticVersion {
	public static greatest(...versions: SemanticVersion[]) {
		return versions.sort((a, b) => b.compareTo(a))[0];
	}
	private readonly _major: number;
	private readonly _minor: number;
	private readonly _patch: number;
	constructor(version: string) {
		const match = version.match(/(\d+)\.(\d+)\.(\d+)/);
		if (!match) {
			throw new Error('Invalid version format');
		}
		this._major = parseInt(match[1]);
		this._minor = parseInt(match[2]);
		this._patch = parseInt(match[3]);
	}
	public canUpgradeTo(version: SemanticVersion) {
		return (
			version.major === this._major &&
			(
				version.minor > this._minor ||
				(
					version.minor === this._minor &&
					version.patch > this._patch
				)
			)
		);
	}
	public compareTo(version: SemanticVersion) {
		if (this._major !== version._major) {
			return this._major - version._major;
		}
		if (this._minor !== version._minor) {
			return this._minor - version._minor;
		}
		if (this._patch !== version._patch) {
			return this._patch - version._patch;
		}
		return 0;
	}
	public toString() {
		return `${this._major}.${this._minor}.${this._patch}`;
	}
	public get major() {
		return this._major;
	}
	public get minor() {
		return this._minor;
	}
	public get patch() {
		return this._patch;
	}
}