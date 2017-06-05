export function isStateEqual(a: NewReplyNotification, b: NewReplyNotification) {
	return a.lastReply === b.lastReply &&
		a.lastNewReplyAck === b.lastNewReplyAck &&
		a.lastNewReplyDesktopNotification === b.lastNewReplyDesktopNotification;
}
export function hasNewUnreadReply(notification: NewReplyNotification) {
	return notification.lastReply > notification.lastNewReplyAck;
}
interface NewReplyNotification {
	lastReply: number,
	lastNewReplyAck: number,
	lastNewReplyDesktopNotification: number,
	timestamp: number
}
export default NewReplyNotification;