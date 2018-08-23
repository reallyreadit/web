import ParseResult from '../common/ParseResult';
import { matchGetAbsoluteUrl, getElementAttribute } from './utils';

function findMetaElementContent(property: string, elements: Element[]) {
	return getElementAttribute<HTMLMetaElement>(
		elements.find(e => e.getAttribute('property') === property),
		e => e.content ? e.content.toLowerCase() : null
	);
}
function parseOpenGraph(): ParseResult {
	const elements = Array.from(document.getElementsByTagName('meta'));
	if (findMetaElementContent('og:type', elements) === 'article') {
		return {
			url: findMetaElementContent('og:url', elements),
			article: {
				title: findMetaElementContent('og:title', elements),
				source: {
					name: findMetaElementContent('og:site_name', elements)
				},
				datePublished: findMetaElementContent('article:published_time', elements),
				dateModified: findMetaElementContent('article:modified_time', elements),
				authors: elements
					.filter(e => e.getAttribute('property') === 'article:author')
					.map(e => {
						const url = matchGetAbsoluteUrl(e.content);
						return url ? { url } : { name: e.content };
					}),
				section: findMetaElementContent('article:section', elements),
				description: findMetaElementContent('og:description', elements),
				tags: elements
					.filter(e => e.getAttribute('property') === 'article:tag')
					.map(e => e.content),
				pageLinks: []
			}
		};
	}
	return null;
}

export default parseOpenGraph;