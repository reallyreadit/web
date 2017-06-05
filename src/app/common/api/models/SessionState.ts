import UserAccount from './UserAccount';
import NewReplyNotification from '../../../../common/models/NewReplyNotification';

interface SessionState {
	userAccount: UserAccount,
	newReplyNotification: NewReplyNotification
}
export default SessionState;