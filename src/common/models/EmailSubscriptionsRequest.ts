import NotificationPreference from './notifications/NotificationPreference';

export default interface EmailSubscriptionsRequest {
	isValid: boolean,
	emailAddress?: string,
	preference?: NotificationPreference
}