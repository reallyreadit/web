interface Article {
	id: string,
	title: string,
	slug: string,
	sourceId: string,
	datePublished: string,
	dateModified: string,
	section: string,
	description: string,
	source: string,
	url: string,
	authors: string[],
	tags: string[],
	wordCount: number,
	readableWordCount: number,
	pageCount: number,
	percentComplete: number,
	commentCount: number
}
export default Article;