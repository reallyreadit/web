import UserAccount from './UserAccount';
import NewReplyNotification from './NewReplyNotification';

interface SessionState {
	userAccount: UserAccount,
	newReplyNotification: NewReplyNotification
}
export default SessionState;