import Notification from './Notification';
import UserAccount from '../../../common/models/UserAccount';

export default interface NotificationsQueryResult {
	cleared: string[],
	created: Notification[],
	user: UserAccount
}