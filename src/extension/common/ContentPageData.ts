import PageLink from './PageLink';

interface ContentPageData {
	slug: string,
	title: string,
	wordCount: number,
	readState: number[],
	percentComplete: number,
	url: string,
	datePublished?: string,
	author?: string,
	pageNumber: number,
	pageLinks: PageLink[],
	sourceId: string
}
export default ContentPageData;