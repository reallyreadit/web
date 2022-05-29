// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export enum DisplayTheme {
	Light = 1,
	Dark = 2
}
export default interface DisplayPreference {
	hideLinks: boolean,
	textSize: number,
	theme: DisplayTheme
}
export function areEqual(a: DisplayPreference, b: DisplayPreference) {
	return (
		a.hideLinks === b.hideLinks &&
		a.textSize === b.textSize &&
		a.theme === b.theme
	);
}
export function getClientPreferredColorScheme() {
	if (
		window
			.matchMedia('(prefers-color-scheme: dark)')
			.matches
	) {
		return DisplayTheme.Dark;
	}
	return DisplayTheme.Light;
}
export function getClientDefaultDisplayPreference() {
	return {
		hideLinks: true,
		textSize: 1,
		theme: getClientPreferredColorScheme()
	};
}
export function getDisplayPreferenceChangeMessage(prevPreference: DisplayPreference, nextPreference: DisplayPreference) {
	let message: string;
	if (nextPreference.hideLinks !== prevPreference.hideLinks) {
		message = `Links ${nextPreference.hideLinks ? 'Disabled' : 'Enabled'}`;
	} else if (nextPreference.textSize !== prevPreference.textSize) {
		message = `Text Size ${nextPreference.textSize > prevPreference.textSize ? 'Increased' : 'Decreased'}`;
	} else if (nextPreference.theme !== prevPreference.theme) {
		message = `${nextPreference.theme === DisplayTheme.Dark ? 'Dark' : 'Light'} Theme Enabled`;
	}
	return message;
}