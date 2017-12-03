export default interface UserArticle {
	id: string,
	title: string,
	slug: string,
	sourceId: string,
	source: string,
	datePublished: string,
	dateModified: string,
	section: string,
	description: string,
	aotdTimestamp: string,
	score: number,
	url: string,
	authors: string[],
	tags: string[],
	wordCount: number,
	readableWordCount: number,
	pageCount: number,
	commentCount: number,
	latestCommentDate: string,
	readCount: number,
	latestReadDate: string,
	userAccountId: string,
	wordsRead: number,
	dateCreated: string,
	lastModified: string,
	percentComplete: number,
	isRead: boolean,
	dateStarred: string
}