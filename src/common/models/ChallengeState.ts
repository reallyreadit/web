import Challenge from "./Challenge";
import ChallengeResponse from "./ChallengeResponse";
import ChallengeScore from "./ChallengeScore";

export default interface ChallengeState {
	activeChallenge?: Challenge,
	latestResponse?: ChallengeResponse,
	score?: ChallengeScore
}