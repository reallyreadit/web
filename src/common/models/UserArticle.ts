// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ArticleFlair from './ArticleFlair';

export interface ArticleAuthor {
	name: string;
	slug: string;
}
export default interface UserArticle {
	id: number;
	title: string;
	slug: string;
	source: string;
	datePublished: string | null;
	section: string;
	description: string;
	aotdTimestamp: string | null;
	url: string;
	articleAuthors: ArticleAuthor[];
	tags: string[];
	wordCount: number;
	commentCount: number;
	readCount: number;
	averageRatingScore: number | null;
	dateCreated: string | null;
	percentComplete: number;
	isRead: boolean;
	dateStarred: string | null;
	ratingScore: number | null;
	datesPosted: string[];
	hotScore: number;
	ratingCount: number;
	firstPoster: string | null;
	flair: ArticleFlair;
	aotdContenderRank: number;
	proofToken: string | null;
	imageUrl: string | null;
}
export function areEqual(a: UserArticle, b: UserArticle) {
	if (!a || !b) {
		return false;
	}
	return (
		a.id === b.id &&
			a.title === b.title &&
			a.slug === b.slug &&
			a.source === b.source &&
			a.datePublished === b.datePublished &&
			a.section === b.section &&
			a.description === b.description &&
			a.aotdTimestamp === b.aotdTimestamp &&
			a.url === b.url &&
			a.articleAuthors.length === b.articleAuthors.length &&
			a.articleAuthors.every((author) =>
				b.articleAuthors.some((otherAuthor) => otherAuthor.slug === author.slug)
			),
		a.tags.length === b.tags.length &&
			a.tags.every((tag) => b.tags.includes(tag)) &&
			a.wordCount === b.wordCount &&
			a.commentCount === b.commentCount &&
			a.readCount === b.readCount &&
			a.averageRatingScore === b.averageRatingScore &&
			a.dateCreated === b.dateCreated &&
			a.percentComplete === b.percentComplete &&
			a.isRead === b.isRead &&
			a.dateStarred === b.dateStarred &&
			a.ratingScore === b.ratingScore &&
			a.datesPosted.length === b.datesPosted.length &&
			a.datesPosted.every((date) => b.datesPosted.includes(date)) &&
			a.hotScore === b.hotScore &&
			a.ratingCount === b.ratingCount &&
			a.firstPoster === b.firstPoster &&
			a.flair === b.flair &&
			a.aotdContenderRank === b.aotdContenderRank &&
			a.proofToken === b.proofToken &&
			a.imageUrl === b.imageUrl
	);
}
export function isReadupBlogPost(article: Pick<UserArticle, 'slug'>) {
	return article.slug.split('_')[0] === 'blogreadupcom';
}
