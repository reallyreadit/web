import EmailSubscriptions from './EmailSubscriptions';

export default interface EmailSubscriptionsRequest {
	isValid: boolean,
	emailAddress: string,
	subscriptions: EmailSubscriptions
}