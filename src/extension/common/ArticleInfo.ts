import PageLinkInfo from './PageLinkInfo';

interface ArticleInfo {
	title: string,
	datePublished?: string,
	author?: string,
	pageLinks?: PageLinkInfo[]
}
export default ArticleInfo;