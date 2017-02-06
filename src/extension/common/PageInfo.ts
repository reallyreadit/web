import ArticleInfo from './ArticleInfo';

interface Page {
	url: string,
	number: number,
	wordCount?: number,
	article: ArticleInfo
}
export default Page;