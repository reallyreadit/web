import AlertPreference from './AlertPreference';

export default interface NotificationPreference {
	companyUpdate: boolean,
	aotd: AlertPreference,
	post: AlertPreference,
	reply: AlertPreference,
	loopback: AlertPreference,
	follower: AlertPreference
}