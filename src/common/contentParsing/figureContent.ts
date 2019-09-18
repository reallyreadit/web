import { findWordsInAttributes, isValidImgElement } from './utils';
import ImageContainerContentConfig from './configuration/ImageContainerContentConfig';

function getChildNodesTextContent(element: Element) {
	let text = '';
	for (const child of element.childNodes) {
		if (child.nodeType === Node.TEXT_NODE) {
			text += child.textContent;
		}
	}
	return text;
}

export function isValidContent(element: Element, config: ImageContainerContentConfig) {
	return (
		!config.nodeNameBlacklist.some(nodeName => element.nodeName === nodeName) &&
		(
			element.nodeName === 'NOSCRIPT' ||
			config.nodeNameWhitelist.some(nodeName => element.nodeName === nodeName || !!element.getElementsByTagName(nodeName).length) ||
			!getChildNodesTextContent(element).trim()
		) &&
		!findWordsInAttributes(element).some(word => config.attributeBlacklist.includes(word)) &&
		(
			element.nodeName === 'IMG' ?
				isValidImgElement(element as HTMLImageElement) :
				true
		)
	);
}