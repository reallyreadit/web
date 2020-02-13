import NotificationAuthorizationRequestResult from '../app/NotificationAuthorizationRequestResult';

export default interface OrientationAnalytics {
	trackingPlayCount: number,
	trackingSkipped: boolean,
	trackingDuration: number,
	importPlayCount: number,
	importSkipped: boolean,
	importDuration: number,
	notificationsResult: NotificationAuthorizationRequestResult,
	notificationsSkipped: boolean,
	notificationsDuration: number,
	shareResultId: string | null,
	shareSkipped: boolean,
	shareDuration: number
}