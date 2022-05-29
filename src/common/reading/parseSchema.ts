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

function first(value: any, map?: (value: any) => any) {
	const retValue = value instanceof Array ? value[0] : value;
	return map && retValue ? map(retValue) : retValue;
}
function many(value: any, map?: (value: any) => any) {
	const retValue = value instanceof Array ? value : value ? [value] : [];
	return map ? retValue.map(map) : retValue;
}
function processKeywords(keywords: any) {
	const tags: string[] = [];
	if (keywords) {
		if (
			Array.isArray(keywords)
		) {
			for (const element of keywords) {
				tags.push(
					...processKeywords(element)
				);
			}
		} else if (
			typeof keywords === 'string'
		) {
			tags.push(
				...keywords.split(',')
			);
		}
	}
	return tags;
}
function parseSchema(topLevelTypes: any[]): ParseResult {
	const data = topLevelTypes.find(
		type =>
			type.hasOwnProperty('@type') &&
			(type['@type'].endsWith('Article') || type['@type'] === 'BlogPosting')
	);
	if (data) {
		const firstImage = first(data.image);
		return {
			url: first(data.url),
			article: {
				title: first(data.headline) || first(data.name),
				source: first(data.publisher || data.sourceOrganization || data.provider, x => ({
					name: first(x.name),
					url: first(x.url)
				})) || {},
				datePublished: first(data.datePublished),
				dateModified: first(data.dateModified),
				authors: many(data.author || data.creator, x => ({
					name: first(x.name),
					url: first(x.url)
				})),
				section: first(data.articleSection) || first(data.printSection),
				description: first(data.description),
				tags: processKeywords(data.keywords),
				pageLinks: [],
				imageUrl: firstImage ?
					typeof firstImage === 'string' || typeof firstImage === 'object' ?
						typeof firstImage === 'string' ?
							firstImage :
							firstImage.contentUrl || firstImage.url :
						null :
					null
			}
		}
	}
	return null;
}

export default parseSchema;