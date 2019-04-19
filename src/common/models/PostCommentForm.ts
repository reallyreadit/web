export default interface PostCommentForm {
	text: string,
	articleId: number,
	parentCommentId?: string
}