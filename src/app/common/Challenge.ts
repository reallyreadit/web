import ChallengeState from '../../common/models/ChallengeState';
import EventEmitter from './EventEmitter';
import EventType from './EventType';

export default abstract class extends EventEmitter<{
	'change': {
		state: ChallengeState,
		eventType: EventType
	}
}> {
	protected abstract getState(): ChallengeState;
	protected abstract setState(challengeState: ChallengeState): void;
	public update(challengeState: Partial<ChallengeState>) {
		const nextState = { ...this.getState(), ...challengeState };
		this.setState(nextState);
		this.emitEvent('change', {
			state: nextState,
			eventType: EventType.Original
		});
	}
	public get activeChallenge() {
		return this.getState().activeChallenge;
	}
	public get latestResponse() {
		return this.getState().latestResponse;
	}
	public get score() {
		return this.getState().score;
	}
}