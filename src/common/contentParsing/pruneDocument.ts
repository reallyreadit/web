// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ParseResult from './ParseResult';
import ContentContainer from './ContentContainer';
import { buildLineage, zipContentLineages, isImageContainerElement, isElement, isReadupElement } from './utils';
import ImageContainer from './ImageContainer';
import { isValidContent, createMetadataElements } from './figureContent';
import ImageContainerContentConfig from './configuration/ImageContainerContentConfig';
import configs from './configuration/configs';
import TextContainer from './TextContainer';

const whitelistedScriptTypes = [
	'application/json',
	'application/ld+json',
	'text/template'
];
function prune(element: ChildNode, depth: number, isInsideImageContainer: boolean, content: Node[][], images: ImageContainer[], config: ImageContainerContentConfig) {
	if (
		isElement(element) &&
		(isReadupElement(element) || element.nodeName === 'NOSCRIPT' || element.nodeName === 'BR')
	) {
		return;
	} else if (
		(depth > content.length - 1 || !content[depth].includes(element)) &&
		!(isInsideImageContainer && isElement(element) && isValidContent(element, config))
	) {
		element.remove();
	} else {
		const isImageContainer = !isInsideImageContainer && isImageContainerElement(element);
		if (isImageContainer) {
			const image = images.find(image => image.containerElement === element);
			if (image) {
				image.containerElement.classList.add('com_readup_article_image_container');
				createMetadataElements(image.caption, image.credit, element as HTMLElement);
			}
		}
		Array
			.from(element.childNodes)
			.forEach(child => {
				prune(child, depth + 1, isImageContainer || isInsideImageContainer, content, images, config);
			});
	}
}
function extendLineagesToContentSearchRootElement<T extends ContentContainer>(
	containers: T[],
	primaryTextRootNode: Element,
	contentSearchRootElement: Element,
	newContainer: (container: T, extendedLineage: Node[]) => T
) {
	if (primaryTextRootNode === contentSearchRootElement) {
		return containers;
	}
	const lineage = buildLineage({
		descendant: primaryTextRootNode.parentElement,
		ancestor: contentSearchRootElement
	});
	return containers.map(
		container => newContainer(container, lineage)
	);
}
export default function pruneDocument(parseResult: ParseResult) {
	// extend image and preformatted text container lineages if the search started at a lower depth
	const imageContainers = extendLineagesToContentSearchRootElement(
		parseResult.imageContainers,
		parseResult.primaryTextRootNode,
		parseResult.contentSearchRootElement,
		(container, extendedLineage) => new ImageContainer(
			extendedLineage.concat(container.containerLineage),
			container.contentLineages.map(
				contentLineage => extendedLineage.concat(contentLineage)
			),
			container.caption,
			container.credit
		)
	);
	const preformattedTextContainers = extendLineagesToContentSearchRootElement(
		parseResult.preformattedTextContainers,
		parseResult.primaryTextRootNode,
		parseResult.contentSearchRootElement,
		(container, extendedLineage) => new TextContainer(
			extendedLineage.concat(container.containerLineage),
			container.contentLineages.map(
				contentLineage => extendedLineage.concat(contentLineage)
			),
			container.wordCount
		)
	);
	// zip text, image and preformatted text content lineages
	let content = zipContentLineages(
		(parseResult.primaryTextContainers as ContentContainer[])
			.concat(imageContainers)
			.concat(preformattedTextContainers)
	);
	if (parseResult.contentSearchRootElement !== document.body) {
		// extend the content lineages up to the body element
		content = buildLineage({
				descendant: parseResult.contentSearchRootElement.parentElement,
				ancestor: document.body
			})
			.map(ancestor => ([ancestor]))
			.concat(content);
	}
	// check for whitelisted scripts
	const whitelistedScripts = Array
		.from(document.querySelectorAll('body script'))
		.filter(script => whitelistedScriptTypes.includes((script as HTMLScriptElement).type));
	if (whitelistedScripts.length) {
		Array
			.from(whitelistedScripts)
			.forEach(
				script => {
					buildLineage({
							descendant: script.hasChildNodes() ?
								script.childNodes[0] :
								script,
							ancestor: document.body
						})
						.forEach(
							(element, index) => {
								if (index < content.length) {
									if (!content[index].includes(element)) {
										content[index].push(element);
									}
								} else {
									content.push([element]);
								}
							}
						)
				}
			)
	}
	// strip head and body siblings
	Array
		.from(document.documentElement.children)
		.forEach(
			child => {
				if (child.nodeName !== 'HEAD' && child.nodeName !== 'BODY') {
					child.remove();
				}
			}
		);
	// prune the document
	prune(document.body, 0, false, content, imageContainers, configs.universal.imageContainerContent);
	// trim the lineage if possible (this might break some sites. required on React sites that trash the root on script errors)
	if (document.body.children.length === 1) {
		let contentRoot: Element = document.body.children[0];
		while (
			contentRoot.children.length === 1 &&
			!parseResult.primaryTextContainers.some(container => container.containerElement === contentRoot)
		) {
			contentRoot = contentRoot.children[0];
		}
		if (contentRoot !== document.body.children[0]) {
			document.body.replaceChild(contentRoot, document.body.children[0]);
		}
	}
	// move the content into a new root element for css targeting
	const contentRoot = document.createElement('div');
	contentRoot.id = 'com_readup_article_content';
	contentRoot.append(
		...Array
			.from(document.body.children)
			.filter(
				child => !isReadupElement(child)
			)
	);
	// wrap the content in a scroll container to prevent infinite scroll scripts
	const scrollRoot = document.createElement('div');
	scrollRoot.id = 'com_readup_scroll_container';
	scrollRoot.append(contentRoot);
	document.body.prepend(scrollRoot);
	return {
		contentRoot,
		scrollRoot
	};
}