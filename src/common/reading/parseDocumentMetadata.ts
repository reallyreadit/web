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
import parseElementMicrodata from './parseElementMicrodata';
import parseSchema from './parseSchema';
import parseMiscMetadata from './parseMiscMetadata';
import parseOpenGraph from './parseOpenGraph';
import { ParserDocumentLocation } from '../ParserDocumentLocation';

export interface MetadataParseResult {
	isArticle: boolean,
	metadata: ParseResult
}
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
		url: misc.url,
		article: {
			title: first(x => x.article.title, orderedResults),
			source: first(x => x.article.source, x => !!x.name, orderedResults),
			datePublished: first(x => x.article.datePublished, orderedResults),
			dateModified: first(x => x.article.dateModified, orderedResults),
			authors: most(x => x.article.authors, x => !!x.name, orderedResults),
			section: first(x => x.article.section, orderedResults),
			description: first(x => x.article.description, orderedResults),
			tags: most(x => x.article.tags, orderedResults),
			pageLinks: most(x => x.article.pageLinks, orderedResults),
			imageUrl: first(x => x.article.imageUrl, [misc, openGraph, schema])
		}
	};
}
const articleElementAttributeBlacklistRegex = /((^|\W)comments?($|\W))/i;
export interface ParserParams {
	url: ParserDocumentLocation
}
export default function parseDocumentMetadata(params: ParserParams) {
	let isArticle = false;
	// misc
	const misc = parseMiscMetadata(params.url);
	if (
		Array
			.from(document.getElementsByTagName('article'))
			.filter(
				element => !(
					articleElementAttributeBlacklistRegex.test(element.id) ||
					articleElementAttributeBlacklistRegex.test(element.classList.value)
				)
			)
			.length === 1
	) {
		isArticle = true;
	}
	// OpenGraph
	let openGraph = parseOpenGraph(params.url);
	if (openGraph) {
		isArticle = true;
	} else {
		openGraph = emptyResult;
	}
	// schema.org
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
			// LD+JSON parse error
		}
	}
	// log or parse document microdata
	if (schema) {
		isArticle = true;
	} else if (schema = parseSchema(parseElementMicrodata(document.documentElement))) {
		isArticle = true;
	} else {
		schema = emptyResult;
	}
	// merge metadata objects
	return { isArticle, metadata: merge(schema, misc, openGraph) };
}