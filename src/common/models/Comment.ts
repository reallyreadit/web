interface Comment {
	id: string,
	dateCreated: string,
	text: string,
	articleId: string,
	articleTitle: string,
	articleSlug: string,
	userAccountId: string,
	userAccount: string,
	children: Comment[],
	dateRead: string,
	parentCommentId: string
}
export default Comment;