import PageLink from '../common/PageLink';

interface ContentPageMetadata {
	url: string,
	title: string,
	element: Element,
	datePublished?: string,
	author?: string,
	pageNumber?: number,
	pageLinks?: PageLink[]
}
export default ContentPageMetadata;