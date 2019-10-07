export default interface UserArticle {
	id: number,
	title: string,
	slug: string,
	source: string,
	datePublished: string | null,
	section: string,
	description: string,
	aotdTimestamp: string | null,
	url: string,
	authors: string[],
	tags: string[],
	wordCount: number,
	commentCount: number,
	readCount: number,
	averageRatingScore: number | null,
	dateCreated: string | null,
	percentComplete: number,
	isRead: boolean,
	dateStarred: string | null,
	ratingScore: number | null,
	datePosted: string | null,
	proofToken: string | null
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
		a.authors.length === b.authors.length &&
		a.authors.every(author => b.authors.includes(author)),
		a.tags.length === b.tags.length &&
		a.tags.every(tag => b.tags.includes(tag)) &&
		a.wordCount === b.wordCount &&
		a.commentCount === b.commentCount &&
		a.readCount === b.readCount &&
		a.averageRatingScore === b.averageRatingScore &&
		a.dateCreated === b.dateCreated &&
		a.percentComplete === b.percentComplete &&
		a.isRead === b.isRead &&
		a.dateStarred === b.dateStarred &&
		a.ratingScore === b.ratingScore &&
		a.datePosted === b.datePosted &&
		a.proofToken === b.proofToken
	);
}