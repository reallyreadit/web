import NotificationPreference from './notifications/NotificationPreference';
import AuthServiceAccountAssociation from './auth/AuthServiceAccountAssociation';
import DisplayPreference from './userAccounts/DisplayPreference';
import AuthorProfile from './authors/AuthorProfile';

export default interface Settings {
	displayPreference: DisplayPreference,
	notificationPreference: NotificationPreference,
	timeZoneDisplayName: string,
	authServiceAccounts: AuthServiceAccountAssociation[],
	authorProfile: AuthorProfile | null
}