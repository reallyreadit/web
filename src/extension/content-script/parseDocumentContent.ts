import Readability, { ParseResult } from './Readability';
import ContentElement from './ContentElement';
import { cloneNodeWithReference } from './utils';

export default function (mode: 'analyze' | 'mutate') {
	let parseResult: ParseResult;
	let contentElements: HTMLElement[];
	switch (mode) {
		case 'analyze':
			const docClone = cloneNodeWithReference(window.document);
			parseResult = new Readability(docClone).parse();
			contentElements = Array
				.from(parseResult.rootElement.getElementsByTagName('p'))
				.map(p => {
					if (p.originalNode) {
						return p.originalNode as HTMLElement;
					}
					// no idea if checking the parentElement is necessary
					// is even a good idea
					if (p.parentElement.originalNode) {
						return p.parentElement.originalNode as HTMLElement;
					}
					return null;
				})
				.filter(element => !!element);
			break;
		case 'mutate':
			parseResult = new Readability(window.document).parse();
			window.document.body.innerHTML = parseResult.content;
			contentElements = Array.from(window.document.body.getElementsByTagName('p'));
			break;
		default:
			throw new Error('Unexpected value for mode');
	}
	if (parseResult.length) {
		return {
			excerpt: parseResult.excerpt,
			elements: contentElements
				.map(element => new ContentElement(element, element.textContent.split(' ').length)),
			wordCount: parseResult.textContent.split(' ').length
		};
	}
	return {
		excerpt: null,
		elements: [] as ContentElement[],
		wordCount: 0
	};
}