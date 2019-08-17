import UserArticle from '../UserArticle';
import CommentThread from '../CommentThread';

export default interface Post {
	date: string,
	userName: string,
	article: UserArticle,
	comment: CommentThread | null
}