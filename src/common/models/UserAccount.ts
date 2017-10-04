import UserAccountRole from './UserAccountRole';

export default interface UserAccount {
	id: string,
	name: string,
	email: string,
	receiveReplyEmailNotifications: boolean,
	receiveReplyDesktopNotifications: boolean,
	lastNewReplyAck: string,
	lastNewReplyDesktopNotification: string,
	dateCreated: string,
	role: UserAccountRole,
	receiveWebsiteUpdates: boolean,
	receiveSuggestedReadings: boolean,
	isEmailConfirmed: boolean,
}