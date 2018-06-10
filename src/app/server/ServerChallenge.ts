import Challenge from "../common/Challenge";
import ChallengeState from "../../common/models/ChallengeState";

export default class extends Challenge {
	private _state: ChallengeState;
	constructor(challengeState: ChallengeState) {
		super();
		this.setState(challengeState);
	}
	protected getState() {
		return this._state;
	}
	protected setState(challengeState: ChallengeState) {
		this._state = challengeState;
	}
	public getInitData() {
		return this._state;
	}
}