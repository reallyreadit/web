// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ParseResult from './ParseResult';
import { matchGetAbsoluteUrl, getElementAttribute } from './utils';
import { ParserDocumentLocation } from '../ParserDocumentLocation';

function findMetaElementContent(property: string, elements: Element[]) {
	return getElementAttribute<HTMLMetaElement>(
		elements.find((e) => e.getAttribute('property') === property),
		(e) => e.content
	);
}
function parseOpenGraph(documentLocation: ParserDocumentLocation): ParseResult {
	const elements = Array.from(document.getElementsByTagName('meta'));
	if (/article/i.test(findMetaElementContent('og:type', elements))) {
		return {
			url: findMetaElementContent('og:url', elements),
			article: {
				title: findMetaElementContent('og:title', elements),
				source: {
					name: findMetaElementContent('og:site_name', elements),
				},
				datePublished: findMetaElementContent(
					'article:published_time',
					elements
				),
				dateModified: findMetaElementContent('article:modified_time', elements),
				authors: elements
					.filter((e) => e.getAttribute('property') === 'article:author')
					.map((e) => {
						const url = matchGetAbsoluteUrl(
							documentLocation.protocol,
							e.content
						);
						return url ? { url } : { name: e.content };
					}),
				section: findMetaElementContent('article:section', elements),
				description: findMetaElementContent('og:description', elements),
				tags: elements
					.filter((e) => e.getAttribute('property') === 'article:tag')
					.map((e) => e.content),
				pageLinks: [],
				imageUrl: findMetaElementContent('og:image', elements),
			},
		};
	}
	return null;
}

export default parseOpenGraph;
