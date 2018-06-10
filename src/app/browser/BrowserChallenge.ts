import Challenge from "../common/Challenge";
import ChallengeState from "../../common/models/ChallengeState";
import ObjectStore from "../../common/webStorage/ObjectStore";
import EventType from "../common/EventType";

export default class extends Challenge {
	private readonly _store: ObjectStore<ChallengeState>;
	constructor(challengeState: ChallengeState) {
		super();
		this._store = new ObjectStore<ChallengeState>(
			'challenge',
			{
				activeChallenge: null,
				latestResponse: null,
				score: null
			}
		);
		this._store.addEventListener((prevState, nextState) => {
			this.emitEvent('change', {
				state: nextState,
				eventType: EventType.Sync
			});
		});
		this.setState(challengeState);
	}
	protected getState() {
		return this._store.get();
	}
	protected setState(challengeState: ChallengeState) {
		this._store.set(challengeState);
	}
}