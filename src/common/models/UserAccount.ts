import UserAccountRole from './UserAccountRole';

export default interface UserAccount {
	id: number,
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
	timeZoneId: number | null,
	timeZoneName: string | null,
	timeZoneDisplayName: string | null
}