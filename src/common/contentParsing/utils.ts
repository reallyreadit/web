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
export function zipContentLineages(containers: ContentContainer[]) {
	return containers
		.reduce<Node[][]>(
			(depths, container) => {
				container.contentLineages.forEach(lineage => {
					lineage.forEach((node, index) => {
						if (!depths[index].includes(node)) {
							depths[index].push(node);
						}
					})
				});
				return depths;
			},
			Array
				.from(
					new Array(
						Math.max(
							...containers.map(
								container => Math.max(
									...container.contentLineages.map(lineage => lineage.length)
								)
							)
						)
					)
				)
				.map(() => ([]))
		);
}