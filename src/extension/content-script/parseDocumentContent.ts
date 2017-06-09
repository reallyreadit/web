import Readability from './Readability';
import ContentElement from './ContentElement';

const wordRegEx = /\S+/g;
function getReadabilityUri() {
	const loc = document.location;
	return {
		spec: loc.href,
		host: loc.host,
		prePath: loc.protocol + '//' + loc.host,
		scheme: loc.protocol.substr(0, loc.protocol.indexOf(':')),
		pathBase: loc.protocol + '//' + loc.host +  loc.pathname.substr(0, loc.pathname.lastIndexOf('/') + 1)
	};
}
function getContentElements(node: Node, contentEls: Set<ContentElement>) {
	let wordCount = 0;
	const potentialContentEl = (
		node.nodeType === Node.ELEMENT_NODE &&
		node.ref &&
		(node.ref as HTMLElement).offsetParent &&
		(node.ref as HTMLElement).offsetHeight > 0
	);
	for (let i = 0; i < node.childNodes.length; i++) {
		const childNode = node.childNodes[i];
		switch (childNode.nodeType) {
			case Node.ELEMENT_NODE:
				getContentElements(childNode, contentEls);
				break;
			case Node.TEXT_NODE:
				if (potentialContentEl) {
					const words = childNode.textContent.match(wordRegEx);
					if (words) {
						wordCount += words.length;
					}
				}
				break;
		}
	}
	if (potentialContentEl && wordCount > 5) {
		contentEls.add(new ContentElement(node.ref as HTMLElement, wordCount));
	}
}

export default function () {
	const parseResult = new Readability(getReadabilityUri(), document).parse();
	const elements = new Set<ContentElement>();
	const words = parseResult.content.match(wordRegEx);
	if (words) {
		getContentElements(parseResult.rootEl, elements);
		console.log(`[rrit] ${elements.size} content elements found`);
		return { ...parseResult, elements, wordCount: words.length };
	}
	console.log('[rrit] no content elements found');
	return { ...parseResult, elements, wordCount: 0 };
}