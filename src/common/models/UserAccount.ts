interface UserAccount {
	id: string,
	name: string,
	email: string,
	receiveReplyEmailNotifications: boolean,
	receiveReplyDesktopNotifications: boolean,
	isEmailConfirmed: boolean
}
export default UserAccount;