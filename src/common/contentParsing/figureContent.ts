// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import { findWordsInAttributes, isValidImgElement } from './utils';
import ImageContainerContentConfig from './configuration/ImageContainerContentConfig';

function formatImageMetadata(text: string) {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => !!line)
		.join('<br /><br />');
}
function getChildNodesTextContent(element: Element) {
	let text = '';
	for (const child of element.childNodes) {
		if (child.nodeType === Node.TEXT_NODE) {
			text += child.textContent;
		}
	}
	return text;
}

export function createMetadataElements(
	caption: string,
	credit: string,
	imageElement: HTMLElement
) {
	if (credit && (!caption || credit !== caption)) {
		const creditDiv = document.createElement('div');
		creditDiv.classList.add('com_readup_article_image_credit');
		creditDiv.textContent = credit;
		if (caption) {
			creditDiv.textContent = creditDiv.textContent.replace(caption, '');
		}
		creditDiv.innerHTML = formatImageMetadata(creditDiv.textContent);
		imageElement.insertAdjacentElement('afterend', creditDiv);
	}
	if (caption) {
		const captionDiv = document.createElement('div');
		captionDiv.classList.add('com_readup_article_image_caption');
		captionDiv.textContent = caption;
		if (credit && caption !== credit) {
			captionDiv.textContent = captionDiv.textContent.replace(credit, '');
		}
		captionDiv.innerHTML = formatImageMetadata(captionDiv.textContent);
		imageElement.insertAdjacentElement('afterend', captionDiv);
	}
}
export function isValidContent(
	element: Element,
	config: ImageContainerContentConfig
) {
	return (
		!config.nodeNameBlacklist.some(
			(nodeName) => element.nodeName === nodeName
		) &&
		(config.nodeNameWhitelist.some(
			(nodeName) =>
				element.nodeName === nodeName ||
				!!element.getElementsByTagName(nodeName).length
		) ||
			!getChildNodesTextContent(element).trim()) &&
		!findWordsInAttributes(element).some((word) =>
			config.attributeBlacklist.includes(word)
		) &&
		(element.nodeName === 'IMG'
			? isValidImgElement(element as HTMLImageElement)
			: true)
	);
}
