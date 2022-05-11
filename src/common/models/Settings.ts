import NotificationPreference from './notifications/NotificationPreference';
import AuthServiceAccountAssociation from './auth/AuthServiceAccountAssociation';
import DisplayPreference from './userAccounts/DisplayPreference';
import { SubscriptionStatus } from './subscriptions/SubscriptionStatus';
import { SubscriptionPaymentMethod } from './subscriptions/SubscriptionPaymentMethod';
import AuthorProfile from './authors/AuthorProfile';

export default interface Settings {
	displayPreference: DisplayPreference,
	notificationPreference: NotificationPreference,
	timeZoneDisplayName: string,
	authServiceAccounts: AuthServiceAccountAssociation[],
	subscriptionStatus: SubscriptionStatus,
	subscriptionPaymentMethod: SubscriptionPaymentMethod | null,
	authorProfile: AuthorProfile | null
}