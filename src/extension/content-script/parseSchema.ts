import ParseResult from '../common/ParseResult';

function first(value: any, map?: (value: any) => any) {
	const retValue = value instanceof Array ? value[0] : value;
	return map && retValue ? map(retValue) : retValue;
}
function many(value: any, map?: (value: any) => any) {
	const retValue = value instanceof Array ? value : value ? [value] : [];
	return map ? retValue.map(map) : retValue;
}
function parseSchema(topLevelTypes: any[]): ParseResult {
	const data = topLevelTypes.find(type => type.hasOwnProperty('@type') && type['@type'].endsWith('Article'));
	if (data) {
		return {
			url: first(data.url),
			article: {
				title: first(data.headline) || first(data.name),
				source: first(data.publisher || data.sourceOrganization || data.provider, x => ({
					name: x.name,
					url: x.url
				})) || {},
				datePublished: first(data.datePublished),
				dateModified: first(data.dateModified),
				authors: many(data.author || data.creator, x => ({
					name: x.name,
					url: x.url
				})),
				section: first(data.articleSection) || first(data.printSection),
				description: first(data.description),
				tags: data.keywords ? data.keywords instanceof Array ? data.keywords : data.keywords.split(',') : [],
				pageLinks: []
			}
		}
	}
	return null;
}

export default parseSchema;