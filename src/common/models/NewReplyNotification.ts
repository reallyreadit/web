export function isStateEqual(a: NewReplyNotification, b: NewReplyNotification) {
	return a.lastReply === b.lastReply &&
		a.lastNewReplyAck === b.lastNewReplyAck &&
		a.lastNewReplyDesktopNotification === b.lastNewReplyDesktopNotification;
}
export function hasNewUnreadReply(notification: NewReplyNotification | null) {
	return notification ?
		notification.lastReply > notification.lastNewReplyAck :
		false;
}
export function shouldShowDesktopNotification(notification: NewReplyNotification) {
	return hasNewUnreadReply(notification) &&
		notification.lastReply > notification.lastNewReplyDesktopNotification;
}
export const empty = {
	lastReply: 0,
	lastNewReplyAck: 0,
	lastNewReplyDesktopNotification: 0,
	timestamp: 0
};
export default interface NewReplyNotification {
	lastReply: number,
	lastNewReplyAck: number,
	lastNewReplyDesktopNotification: number,
	timestamp: number
}