import UserAccountRole from './UserAccountRole';

export default interface UserAccount {
	id: number,
	name: string,
	email: string,
	dateCreated: string,
	role: UserAccountRole,
	isEmailConfirmed: boolean,
	timeZoneId: number | null,
	aotdAlert: boolean,
	replyAlertCount: number,
	loopbackAlertCount: number,
	postAlertCount: number,
	followerAlertCount: number
}
export function areEqual(a: UserAccount, b: UserAccount) {
	if (!a || !b) {
		return false;
	}
	return (
		a.id === b.id &&
		a.name === b.name &&
		a.email === b.email &&
		a.dateCreated === b.dateCreated &&
		a.role === b.role &&
		a.isEmailConfirmed === b.isEmailConfirmed &&
		a.timeZoneId === b.timeZoneId &&
		a.aotdAlert === b.aotdAlert &&
		a.replyAlertCount === b.replyAlertCount &&
		a.loopbackAlertCount === b.loopbackAlertCount &&
		a.postAlertCount === b.postAlertCount &&
		a.followerAlertCount === b.followerAlertCount
	);
}