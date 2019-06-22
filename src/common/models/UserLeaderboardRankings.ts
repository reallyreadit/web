import Ranking from './Ranking';

export default interface UserLeaderboardRankings {
	longestRead: Ranking,
	readCount: Ranking,
	scoutCount: Ranking,
	scribeCount: Ranking,
	streak?: Ranking,
	weeklyReadCount: Ranking
}