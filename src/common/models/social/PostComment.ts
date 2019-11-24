import CommentAddendum from './CommentAddendum';

export default interface PostComment {
	id: string,
	text: string,
	addenda: CommentAddendum[]
}