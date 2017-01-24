import Page from './Page';

interface Article {
	slug: string,
	title: string,
	datePublished?: string,
	author?: string,
	pages: Page[],
	commentCount?: number,
	percentComplete: number,
	sourceId: string
}
export default Article;