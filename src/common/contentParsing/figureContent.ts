import { findWordsInAttributes, isValidImgElement } from './utils';

const
	nodeNameBlacklist = ['BUTTON'],
	nodeNameWhitelist = ['IMG', 'META', 'PICTURE', 'SOURCE'],
	attributeBlacklist = ['expand', 'icon', 'share'];

function getChildNodesTextContent(element: Element) {
	let text = '';
	for (const child of element.childNodes) {
		if (child.nodeType === Node.TEXT_NODE) {
			text += child.textContent;
		}
	}
	return text;
}

export function isValidContent(element: Element) {
	return (
		!nodeNameBlacklist.some(nodeName => element.nodeName === nodeName) &&
		(
			nodeNameWhitelist.some(nodeName => element.nodeName === nodeName || !!element.getElementsByTagName(nodeName).length) ||
			!getChildNodesTextContent(element).trim()
		) &&
		!findWordsInAttributes(element).some(word => attributeBlacklist.includes(word)) &&
		(
			element.nodeName === 'IMG' ?
				isValidImgElement(element as HTMLImageElement) :
				true
		)
	);
}