import ChallengeState from "../../common/models/ChallengeState";
import EventEmitter from "../common/EventEmitter";
import UserAccount from "../../common/models/UserAccount";
import NewReplyNotification from "../../common/models/NewReplyNotification";

export default abstract class extends EventEmitter<{
	'challenge': ChallengeState,
	'newReplyNotification': NewReplyNotification,
	'user': UserAccount
}> {
	public abstract updateChallenge(challengeState: ChallengeState): void;
	public abstract updateNewReplyNotification(newReplyNotification: NewReplyNotification): void;
	public abstract updateUser(userAccount: UserAccount): void;
}