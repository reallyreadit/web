import ParseResult from '../common/ParseResult';
import { matchGetAbsoluteUrl, getElementAttribute } from './utils';

export default function parseMiscMetadata(): ParseResult {
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
			title: document.title,
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