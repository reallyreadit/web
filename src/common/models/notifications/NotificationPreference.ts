import NotificationChannel from './NotificationChannel';
import NotificationEventFrequency from './NotificationEventFrequency';

export default interface NotificationPreference {
	companyUpdate: NotificationChannel,
	suggestedReading: NotificationEventFrequency,
	aotd: NotificationChannel,
	reply: NotificationChannel,
	replyDigest: NotificationEventFrequency,
	loopback: NotificationChannel,
	loopbackDigest: NotificationEventFrequency,
	post: NotificationChannel,
	postDigest: NotificationEventFrequency,
	follower: NotificationChannel,
	followerDigest: NotificationEventFrequency
}