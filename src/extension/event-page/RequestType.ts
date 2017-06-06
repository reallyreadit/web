enum RequestType {
	FindSource = 1,
	FindUserArticle = 2,
	CommitReadState = 4,
	CacheRefresh = 8,
	NotificationAck = 16,
	DesktopNotification = 32
}
export default RequestType;