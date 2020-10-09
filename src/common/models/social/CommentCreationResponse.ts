import CommentThread from '../CommentThread';
import UserArticle from '../UserArticle';

export default interface CommentCreationResponse {
	article: UserArticle,
	comment: CommentThread
}