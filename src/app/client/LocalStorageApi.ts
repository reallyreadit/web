import ObjectStore from "../../common/webStorage/ObjectStore";
import ChallengeState from "../../common/models/ChallengeState";
import UserAccount from "../../common/models/UserAccount";
import NewReplyNotification, { empty as emptyNewReplyNotification } from "../../common/models/NewReplyNotification";
import LocalStorageApi from "../common/LocalStorageApi";

export default class extends LocalStorageApi {
	private readonly _challenge: ObjectStore<ChallengeState>;
	private readonly _notification: ObjectStore<NewReplyNotification>;
	private readonly _user: ObjectStore<UserAccount | null>;
	constructor() {
		super();
		this._challenge = new ObjectStore<ChallengeState>(
			'challenge',
			{
				activeChallenge: null,
				latestResponse: null,
				score: null
			}
		);
		this._challenge.addEventListener((prevState, nextState) => {
			this.emitEvent('challenge', nextState);
		});
		this._notification = new ObjectStore<NewReplyNotification>(
			'newReplyNotification',
			emptyNewReplyNotification
		);
		this._notification.addEventListener((prevNotification, nextNotification) => {
			this.emitEvent('newReplyNotification', nextNotification);
		});
		this._user = new ObjectStore<UserAccount | null>('userAccount', null);
		this._user.addEventListener((prevUserAccount, nextUserAccount) => {
			this.emitEvent('user', nextUserAccount);
		});
	}
	public updateChallenge(challengeState: ChallengeState) {
		this._challenge.set(challengeState);
	}
	public updateNewReplyNotification(newReplyNotification: NewReplyNotification) {
		this._notification.set(newReplyNotification);
	}
	public updateUser(userAccount: UserAccount) {
		this._user.set(userAccount);
	}
}