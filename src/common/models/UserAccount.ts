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
	isPasswordSet: boolean,
	hasLinkedTwitterAccount: boolean,
	dateOrientationCompleted: string | null
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
		a.isPasswordSet === b.isPasswordSet &&
		a.hasLinkedTwitterAccount === b.hasLinkedTwitterAccount &&
		a.dateOrientationCompleted === b.dateOrientationCompleted
	);
}
export function hasAnyAlerts(user: UserAccount, alerts?: Alert) {
	if (!user) {
		return false;
	}
	if (alerts != null) {
		if (alerts & Alert.Aotd && user.aotdAlert) {
			return true;
		}
		if (alerts & Alert.Reply && user.replyAlertCount) {
			return true;
		}
		if (alerts & Alert.Loopback && user.loopbackAlertCount) {
			return true;
		}
		if (alerts & Alert.Post && user.postAlertCount) {
			return true;
		}
		if (alerts & Alert.Follower && user.followerAlertCount) {
			return true;
		}
		return false;
	}
	return !!(
		user.aotdAlert ||
		user.replyAlertCount ||
		user.loopbackAlertCount ||
		user.postAlertCount ||
		user.followerAlertCount
	);
}