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

export function buildLineage({
	ancestor, descendant
}: {
	ancestor: Node,
	descendant: Node
}) {
	const lineage = [descendant];
	while (lineage[0] !== ancestor) {
		lineage.unshift(lineage[0].parentElement);
	}
	return lineage;
}
const attributeWordRegex = /[A-Z]?[a-z]+/g;
export function findWordsInAttributes(element: Element) {
	return (
			// searching other attributes such as data-* and src can lead to too many false positives of blacklisted words
			(element.id + ' ' + element.classList.value).match(attributeWordRegex) ||
			[]
		)
		.map(word => word.toLowerCase());
};
const wordRegex = /\S+/g;
export function getWordCount(node: Node) {
	return (node.textContent.match(wordRegex) || []).length;
};
https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
const blockElementNodeNames = ['ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DETAILS', 'DIALOG', 'DD', 'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'UL'];
export function isBlockElement(node: Node): node is HTMLElement {
	return blockElementNodeNames.includes(node.nodeName);
}
export function isElement(node: Node): node is Element {
	return node.nodeType === Node.ELEMENT_NODE;
}
export function isImageContainerElement(node: Node): node is Element {
	return (
		node.nodeName === 'FIGURE' ||
		node.nodeName === 'IMG' ||
		node.nodeName === 'PICTURE'
	);
}
export function isReadupElement(element: Element) {
	return (element.getAttribute('id') || '').startsWith('com_readup_');
}
export function isValidImgElement(imgElement: HTMLImageElement) {
	return (
		(imgElement.naturalWidth <= 1 && imgElement.naturalHeight <= 1) || (
			(imgElement.naturalWidth >= 200 && imgElement.naturalHeight >= 100) ||
			(imgElement.naturalWidth >= 100 && imgElement.naturalHeight >= 200)
		)
	);
}
export function zipContentLineages(containers: ContentContainer[]) {
	return zipLineages(
		containers.reduce<ReadonlyArray<ReadonlyArray<Node>>>(
			(lineages, container) => lineages.concat(container.contentLineages),
			[]
		)
	);
}
export function zipLineages(lineages: ReadonlyArray<ReadonlyArray<Node>>) {
	return lineages.reduce<Node[][]>(
		(depths, lineage) => {
			lineage.forEach(
				(node, index) => {
					if (!depths[index].includes(node)) {
						depths[index].push(node);
					}
				}
			);
			return depths;
		},
		Array
			.from(new Array(Math.max(...lineages.map(lineage => lineage.length))))
			.map(() => ([]))
	);
}