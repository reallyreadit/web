import NotificationPreference from './notifications/NotificationPreference';

export default interface Settings {
	userCount: number,
	notificationPreference: NotificationPreference,
	timeZoneDisplayName: string
}