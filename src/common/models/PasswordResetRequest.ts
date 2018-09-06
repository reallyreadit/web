export default interface PasswordResetRequest {
	id: number,
	dateCreated: string,
	userAccountId: number,
	emailAddress: string,
	dateCompleted: string | null
}