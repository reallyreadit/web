import Ranking from './Ranking';
import StreakRanking from './StreakRanking';

export default interface UserLeaderboardRankings {
	longestRead: Ranking,
	readCount: Ranking,
	scoutCount: Ranking,
	scribeCount: Ranking,
	streak: StreakRanking,
	weeklyReadCount: Ranking
}