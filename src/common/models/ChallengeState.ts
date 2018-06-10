import Challenge from "./Challenge";
import ChallengeResponse from "./ChallengeResponse";
import ChallengeScore from "./ChallengeScore";

export default interface ChallengeState {
	activeChallenge: Challenge | null,
	latestResponse: ChallengeResponse | null,
	score: ChallengeScore | null
}