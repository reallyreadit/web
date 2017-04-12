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
function parseDocumentMetadata() {
	// parse misc. and OpenGraph metadata
	let misc = parseMiscMetadata(),
		openGraph = parseOpenGraph();
	// log misc metadata
	console.log('[rrit] misc metadata:')
	console.log(misc);
	// log OpenGraph metadata or assign empty result
	if (openGraph) {
		console.log('[rrit] OpenGraph metadata:');
		console.log(openGraph);
	} else {
		openGraph = emptyResult;
	}
	// parse schema.org metadata
	let schema: ParseResult;
	// first check for an LD+JSON script
	const script = document.querySelector('script[type="application/ld+json"]');
	if (script && script.textContent) {
		const cdataMatch = script.textContent.match(/^\s*\/\/<!\[CDATA\[([\s\S]*)\/\/\]\]>\s*$/);
		try {
			if (cdataMatch) {
				schema = parseSchema([JSON.parse(cdataMatch[1])]);
			} else {
				schema = parseSchema([JSON.parse(script.textContent)]);
			}
		} catch (ex) {
			console.error('[rrit] LD+JSON parse error');
		}
	}
	// log or parse document microdata
	if (schema) {
		console.log('[rrit] schema.org metadata found (LD+JSON):');
		console.log(schema);
	} else if (schema = parseSchema(parseElementMicrodata(document.documentElement))) {
		console.log('[rrit] schema.org metadata found (Microdata):');
		console.log(schema);
	} else {
		schema = emptyResult;
	}
	// merge metadata objects
	return merge(schema, misc, openGraph);
}

export default parseDocumentMetadata;