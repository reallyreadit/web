export default interface Rating {
	id: number,
	timestamp: string,
	score: number,
	articleId: number,
	userAccountId: number
}