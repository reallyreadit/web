import UserAccountRole from './UserAccountRole';

export default interface UserAccount {
	id: number,
	name: string,
	email: string,
	dateCreated: string,
	role: UserAccountRole,
	isEmailConfirmed: boolean,
	timeZoneId: number | null,
	aotd_alert_count: number,
	reply_alert_count: number,
	loopback_alert_count: number,
	post_alert_count: number,
	follower_alert_count: number
}