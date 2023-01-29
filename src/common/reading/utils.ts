// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

export const absoluteUrlRegex = /^(https?:)?\/{2}(?!\/)/;
export function getElementAttribute<T extends Element>(
	element: Element,
	selector: (element: T) => string
) {
	return element ? selector(element as T) : null;
}
export function matchGetAbsoluteUrl(protocol: string, url: string) {
	if (url) {
		const match = url.match(absoluteUrlRegex);
		if (match) {
			if (!match[1]) {
				return protocol.replace(/:$/, '') + ':' + url;
			} else {
				return url;
			}
		}
	}
	return null;
}
export function getWords(text: string) {
	// better to match words instead of splitting on
	// whitespace in order to avoid empty results
	return (text && text.match(/\S+/g)) || [];
}
