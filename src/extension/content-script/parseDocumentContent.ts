import Readability from './Readability';
import ReadabilityParseResult from './ReadabilityParseResult';
import ContentElement from './ContentElement';
import { cloneNodeWithReference, getWords } from './utils';
import styleArticleDocument from './styleArticleDocument';

function getContentElements(rootElement: HTMLElement) {
	return Array
		.from<HTMLElement>(rootElement.getElementsByTagName('p'))
		.concat(Array.from(rootElement.getElementsByTagName('li')));
}
export default function (mode: 'analyze' | 'mutate') {
	let parseResult: ReadabilityParseResult;
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
			if (!window.document.documentElement) {
				window.document.appendChild(window.document.createElement('html'));
			}
			if (!window.document.head) {
				window.document.documentElement.appendChild(window.document.createElement('head'));
			}
			if (!window.document.body) {
				window.document.documentElement.appendChild(window.document.createElement('body'));
			}
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