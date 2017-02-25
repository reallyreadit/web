import ParseResult from '../common/ParseResult';
import parseElementMicrodata from './parseElementMicrodata';
import parseSchema from './parseSchema';
import parseMiscMetadata from './parseMiscMetadata';
import parseOpenGraph from './parseOpenGraph';

const emptyResult: ParseResult = {
	url: null,
	article: {
		title: null,
		source: {},
		authors: [],
		tags: [],
		pageLinks: []
	}
};
function first<T>(propSelector: (result: ParseResult) => T, results: ParseResult[]): T;
function first<T>(propSelector: (result: ParseResult) => T, filter: (value: T) => boolean, results: ParseResult[]): T;
function first<T>(propSelector: (result: ParseResult) => T, filterOrResults: ((value: T) => boolean) | ParseResult[], results?: ParseResult[]) {
	let filter: (value: T) => boolean;
	if (filterOrResults instanceof Array) {
		filter = value => !!value;
		results = filterOrResults;
	} else {
		filter = filterOrResults;
	}
	return results.map(propSelector).find(filter);
}
function most<T>(propSelector: (result: ParseResult) => T[], results: ParseResult[]): T[];
function most<T>(propSelector: (result: ParseResult) => T[], filter: (value: T) => boolean, results: ParseResult[]): T[];
function most<T>(propSelector: (result: ParseResult) => T[], filterOrResults: ((value: T) => boolean) | ParseResult[], results?: ParseResult[]) {
	let filter: (value: T) => boolean;
	if (filterOrResults instanceof Array) {
		results = filterOrResults;
	} else {
		filter = filterOrResults;
	}
	let values = results.map(propSelector);
	if (filter) {
		values = values.filter(values => values.every(filter));
	}
	return values.sort((a, b) => b.length - a.length)[0];
}
function merge(schema: ParseResult, misc: ParseResult, openGraph: ParseResult): ParseResult {
	const orderedResults = [schema, openGraph, misc];
	return {
		url: first(x => x.url, orderedResults),
		article: {
			title: first(x => x.article.title, orderedResults),
			source: first(x => x.article.source, x => !!x.name, orderedResults),
			datePublished: first(x => x.article.datePublished, orderedResults),
			dateModified: first(x => x.article.dateModified, orderedResults),
			authors: most(x => x.article.authors, x => !!x.name, orderedResults),
			section: first(x => x.article.section, orderedResults),
			description: first(x => x.article.description, orderedResults),
			tags: most(x => x.article.tags, orderedResults),
			pageLinks: most(x => x.article.pageLinks, orderedResults)
		}
	};
}
function parseDocument() {
	const misc = parseMiscMetadata() || emptyResult,
		openGraph = parseOpenGraph() || emptyResult;
	let schema: ParseResult;
	const script = document.querySelector('script[type="application/ld+json"]');
	if (script) {
		schema = parseSchema([JSON.parse(script.textContent)]);
	}
	if (!schema) {
		schema = parseSchema(parseElementMicrodata(document.documentElement)) || emptyResult
	}
	return merge(schema, misc, openGraph);
}

export default parseDocument;