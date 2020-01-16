import NotificationPreference from './notifications/NotificationPreference';
import AuthServiceAccountAssociation from './userAccounts/AuthServiceAccountAssociation';

export default interface Settings {
	userCount: number,
	notificationPreference: NotificationPreference,
	timeZoneDisplayName: string,
	authServiceAccounts: AuthServiceAccountAssociation[]
}