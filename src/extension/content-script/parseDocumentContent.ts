import Readability, { ParseResult } from './Readability';
import ContentElement from './ContentElement';
import { cloneNodeWithReference, getWords } from './utils';
import styleArticleDocument from './styleArticleDocument';

function getContentElements(rootElement: HTMLElement) {
	return Array
		.from<HTMLElement>(rootElement.getElementsByTagName('p'))
		.concat(Array.from(rootElement.getElementsByTagName('li')));
}
export default function (mode: 'analyze' | 'mutate') {
	let parseResult: ParseResult;
	let contentElements: HTMLElement[];
	switch (mode) {
		case 'analyze':
			const docClone = cloneNodeWithReference(window.document);
			parseResult = new Readability(docClone).parse();
			contentElements = getContentElements(parseResult.rootElement)
				.map(element => {
					if (element.originalNode) {
						return element.originalNode as HTMLElement;
					}
					return null;
				})
				.filter(element => !!element);
			break;
		case 'mutate':
			parseResult = new Readability(window.document).parse();
			window.document.body.innerHTML = parseResult.content;
			contentElements = getContentElements(window.document.body);
			styleArticleDocument(window.document, parseResult.title, parseResult.byline);
			break;
		default:
			throw new Error('Unexpected value for mode');
	}
	if (parseResult.length) {
		return {
			excerpt: parseResult.excerpt,
			elements: contentElements.reduce(
				(result, element) => {
					let wordCount: number;
					if (wordCount = getWords(element.textContent).length) {
						result.push(new ContentElement(element, wordCount));
					}
					return result;
				},
				[] as ContentElement[]
			),
			wordCount: getWords(parseResult.textContent).length
		};
	}
	return {
		excerpt: null,
		elements: [] as ContentElement[],
		wordCount: 0
	};
}