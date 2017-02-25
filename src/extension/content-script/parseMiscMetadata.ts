import ParseResult from '../common/ParseResult';
import { getElementAttribute } from './elementUtils';

function parseMiscMetadata(): ParseResult {
	return {
		url: getElementAttribute<HTMLLinkElement>(document.querySelector('link[rel="canonical"]'), e => e.href),
		article: {
			title: null,
			source: {
				url: getElementAttribute<HTMLLinkElement>(document.querySelector('link[rel="publisher"]'), e => e.href)
			},
			description: getElementAttribute<HTMLMetaElement>(document.querySelector('meta[name="description"]'), e => e.content),
			authors: (Array.from(document.querySelectorAll('meta[name="author"]')) as HTMLMetaElement[]).map(e => ({ name: e.content })),
			tags: [],
			pageLinks: []
		}
	};
}

export default parseMiscMetadata;