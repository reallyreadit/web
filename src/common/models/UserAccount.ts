import UserAccountRole from './UserAccountRole';
import Alert from './notifications/Alert';

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
	followerAlertCount: number,
	isPasswordSet: boolean
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
		a.followerAlertCount === b.followerAlertCount &&
		a.isPasswordSet === b.isPasswordSet
	);
}
export function hasAlert(user: UserAccount, alert?: Alert) {
	if (!user) {
		return false;
	}
	if (alert != null) {
		switch (alert) {
			case Alert.Aotd:
				return user.aotdAlert;
			case Alert.Followers:
				return !!user.followerAlertCount;
			case Alert.Following:
				return !!user.postAlertCount;
			case Alert.Inbox:
				return !!(
					user.replyAlertCount ||
					user.loopbackAlertCount
				);
			default:
				throw new Error('Unexpected value for alert');
		}
	}
	return !!(
		user.aotdAlert ||
		user.replyAlertCount ||
		user.loopbackAlertCount ||
		user.postAlertCount ||
		user.followerAlertCount
	);
}