// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import { getWords } from './utils';

type ItemType = { [key: string]: ItemProp | ItemProp[] };
type ItemProp = string | ItemType;

const valueMap: { [key: string]: string } = {
	a: 'href',
	img: 'src',
	link: 'href',
	meta: 'content',
	object: 'data',
	time: 'datetime',
};
const itemTypeRegExp = /schema\.org\/(.+)/;
function isScopeElement(element: Element) {
	return element.hasAttribute('itemscope') || element.hasAttribute('itemtype');
}
function getElementValue(element: Element) {
	// use getAttribute instead of property to avoid case-sensitivity issues
	const tagName = element.tagName.toLowerCase();
	return valueMap.hasOwnProperty(tagName)
		? element.getAttribute(valueMap[tagName])
		: element.textContent;
}
function getElementType(element: Element, isTopLevel?: boolean) {
	const type: { [key: string]: ItemProp } = {};
	if (element.hasAttribute('itemtype')) {
		if (isTopLevel) {
			type['@context'] = 'http://schema.org';
		}
		const itemType = element.getAttribute('itemtype'),
			match = itemType.match(itemTypeRegExp);
		if (match && match.length === 2) {
			type['@type'] = match[1];
		} else {
			type['@type'] = itemType;
		}
	}
	return type;
}
function mergeValue(
	properties: string[],
	value: string,
	scope: ItemType
): string;
function mergeValue(
	properties: string[],
	value: ItemType,
	scope: ItemType
): ItemType;
function mergeValue(properties: string[], value: ItemProp, scope: ItemType) {
	properties.forEach((property) => {
		if (scope.hasOwnProperty(property)) {
			if (scope[property] instanceof Array) {
				(scope[property] as ItemProp[]).push(value);
			} else {
				scope[property] = [scope[property] as ItemProp, value];
			}
		} else {
			scope[property] = value;
		}
	});
	return value;
}
function parseElementMicrodata(
	element: Element,
	topLevelTypes: ItemType[] = [],
	scope: ItemType = null
) {
	// check element for microdata attributes
	// check for scope to guard against invalid itemprops declared outside a scope
	if (scope && element.hasAttribute('itemprop')) {
		const properties = getWords(element.getAttribute('itemprop'));
		if (isScopeElement(element)) {
			// value is a type
			scope = mergeValue(properties, getElementType(element), scope);
			// guard against non-scope elements with an itemid attribute
		} else if (!element.hasAttribute('itemid')) {
			// value is a primitive
			mergeValue(properties, getElementValue(element), scope);
		}
	} else if (isScopeElement(element)) {
		// new top level type
		topLevelTypes.push((scope = getElementType(element, true)));
	}
	// process children
	for (let i = 0; i < element.children.length; i++) {
		parseElementMicrodata(element.children[i], topLevelTypes, scope);
	}
	// return top level types
	return topLevelTypes;
}

export default parseElementMicrodata;
