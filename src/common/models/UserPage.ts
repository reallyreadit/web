export default interface UserPage {
	id: number,
	pageId: number,
	userAccountId: number,
	dateCreated: string,
	lastModified: string | null,
	readableWordCount: number,
	readState: number[],
	wordsRead: number,
	dateCompleted: string | null
}