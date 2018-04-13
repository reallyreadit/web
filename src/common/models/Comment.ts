export default interface Comment {
	id: number,
	dateCreated: string,
	text: string,
	articleId: number,
	articleTitle: string,
	articleSlug: string,
	userAccountId: number,
	userAccount: string,
	children: Comment[],
	dateRead: string,
	parentCommentId: number
}