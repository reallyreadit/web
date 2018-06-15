import ChallengeWinner from './ChallengeWinner';
import ChallengeContender from './ChallengeContender';

export default interface ChallengeLeaderboard {
	winners: ChallengeWinner[],
	contenders: ChallengeContender[]
}