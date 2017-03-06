interface Comment {
	id: string,
	dateCreated: string,
	text: string,
	articleId: string,
	userAccount: string,
	children: Comment[]
}
export default Comment;