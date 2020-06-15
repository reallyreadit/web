import UserLeaderboardRankings from './UserLeaderboardRankings';
import LeaderboardRanking from './LeaderboardRanking';

export default interface Leaderboards {
	longestRead: LeaderboardRanking[],
	readCount: LeaderboardRanking[],
	scout: LeaderboardRanking[],
	scribe: LeaderboardRanking[],
	streak: LeaderboardRanking[],
	userRankings: UserLeaderboardRankings | null,
	weeklyReadCount: LeaderboardRanking[],
	timeZoneName: string | null
}