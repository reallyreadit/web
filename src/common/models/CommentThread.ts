export default interface CommentThread {
	id: string,
	dateCreated: string,
	text: string,
	articleId: number,
	articleTitle: string,
	articleSlug: string,
	userAccountId: number,
	userAccount: string,
	children: CommentThread[],
	dateRead: string,
	parentCommentId: string | null
}