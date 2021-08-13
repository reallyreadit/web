import ParseResult from './ParseResult';
import { matchGetAbsoluteUrl, getElementAttribute } from './utils';
import { ParserDocumentLocation } from '../ParserDocumentLocation';

function parseAuthors() {
	const metaElements = document.querySelectorAll<HTMLMetaElement>('meta[name="author"]');
	if (metaElements.length) {
		return Array
			.from(metaElements)
			.map(
				element => ({
					name: element.content
				})
			);
	}
	// If the microdata structure is malformed it won't be parsed by the microdata parser so we should look for
	// the individual elements here as well.
	const microdataElements = document.querySelectorAll('[itemprop="author"]');
	if (microdataElements.length) {
		return Array
			.from(microdataElements)
			.map(
				element => ({
					name: element.textContent
				})
			);
	}
	return [];
}
export default function parseMiscMetadata(documentLocation: ParserDocumentLocation): ParseResult {
	const articleTitleElements = document.querySelectorAll('article h1');
	return {
		url: documentLocation.href.split(/\?|#/)[0],
		article: {
			title: (
				articleTitleElements.length === 1 ?
					articleTitleElements[0].textContent.trim() :
					document.title
			),
			source: {
				url: (
					matchGetAbsoluteUrl(
						documentLocation.protocol,
						getElementAttribute<HTMLLinkElement>(
							document.querySelector('link[rel="publisher"]'),
							e => e.href
						)
					) ||
					documentLocation.protocol + '//' + documentLocation.hostname
				)
			},
			description: getElementAttribute<HTMLMetaElement>(document.querySelector('meta[name="description"]'), e => e.content),
			authors: parseAuthors(),
			tags: [],
			pageLinks: [],
			imageUrl: getElementAttribute<HTMLMetaElement>(document.querySelector('meta[name="twitter:image"i]'), e => e.content),
		}
	};
}