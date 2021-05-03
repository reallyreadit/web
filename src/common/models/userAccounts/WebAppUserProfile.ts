import UserAccount from '../UserAccount';
import DisplayPreference from './DisplayPreference';
import { SubscriptionStatus } from '../subscriptions/SubscriptionStatus';

export default interface WebAppUserProfile {
	displayPreference?: DisplayPreference,
	subscriptionStatus: SubscriptionStatus,
	userAccount: UserAccount
}