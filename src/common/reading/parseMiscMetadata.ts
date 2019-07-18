import ParseResult from './ParseResult';
import { matchGetAbsoluteUrl, getElementAttribute } from './utils';

export default function parseMiscMetadata(): ParseResult {
	const articleTitleElements = document.querySelectorAll('article h1');
	return {
		url: (
			matchGetAbsoluteUrl(
				getElementAttribute<HTMLLinkElement>(
					document.querySelector('link[rel="canonical"]'),
					e => e.href
				)	
			) ||
			window.location.href.split(/\?|#/)[0]
		),
		article: {
			title: (
				articleTitleElements.length === 1 ?
					articleTitleElements[0].textContent.trim() :
					document.title
			),
			source: {
				url: (
					matchGetAbsoluteUrl(
						getElementAttribute<HTMLLinkElement>(
							document.querySelector('link[rel="publisher"]'),
							e => e.href
						)
					) ||
					window.location.protocol + '//' + window.location.hostname
				)
			},
			description: getElementAttribute<HTMLMetaElement>(document.querySelector('meta[name="description"]'), e => e.content),
			authors: (Array.from(document.querySelectorAll('meta[name="author"]')) as HTMLMetaElement[]).map(e => ({ name: e.content })),
			tags: [],
			pageLinks: []
		}
	};
}