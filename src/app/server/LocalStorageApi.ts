import LocalStorageApi from '../common/LocalStorageApi';
import ChallengeState from '../../common/models/ChallengeState';
import NewReplyNotification from '../../common/models/NewReplyNotification';
import UserAccount from '../../common/models/UserAccount';

export default class extends LocalStorageApi {
	public updateChallenge(challengeState: ChallengeState) {
		throw new Error('Operation not supported in server environment');
	}
	public updateNewReplyNotification(newReplyNotification: NewReplyNotification) {
		throw new Error('Operation not supported in server environment');
	}
	public updateUser(userAccount: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
}