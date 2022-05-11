import NotificationPreference from './notifications/NotificationPreference';
import AuthServiceAccountAssociation from './auth/AuthServiceAccountAssociation';
import DisplayPreference from './userAccounts/DisplayPreference';
import { SubscriptionStatus } from './subscriptions/SubscriptionStatus';
import AuthorProfile from './authors/AuthorProfile';

export default interface Settings {
	displayPreference: DisplayPreference,
	notificationPreference: NotificationPreference,
	timeZoneDisplayName: string,
	authServiceAccounts: AuthServiceAccountAssociation[],
	subscriptionStatus: SubscriptionStatus,
	authorProfile: AuthorProfile | null
}