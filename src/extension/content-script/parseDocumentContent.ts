import Readability from './Readability';

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
function getContentElements(node: Node, contentEls: Set<HTMLElement>) {
	let nodeAddedToSet = false;
	for (let i = 0; i < node.childNodes.length; i++) {
		const childNode = node.childNodes[i];
		if (childNode.nodeType === Node.ELEMENT_NODE) {
			getContentElements(childNode, contentEls);
		} else if (
			!nodeAddedToSet &&
			node.ref &&
			childNode.nodeType === Node.TEXT_NODE &&
			childNode.textContent.trim() !== ''
		) {
			contentEls.add(node.ref as HTMLElement);
			nodeAddedToSet = true;
		}
	}
}

export default function () {
	const contentEls = new Set<HTMLElement>();
	getContentElements(new Readability(getReadabilityUri(), document).parse().rootEl, contentEls);
	console.log(`[rrit] ${contentEls.size} content elements found`);
	return contentEls;
}