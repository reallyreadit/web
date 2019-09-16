import UserLeaderboardRankings from './UserLeaderboardRankings';
import LeaderboardRanking from './LeaderboardRanking';

export default interface Leaderboards {
	longestRead: LeaderboardRanking[],
	readCount: LeaderboardRanking[],
	scout: LeaderboardRanking[],
	scribe: LeaderboardRanking[],
	streak: LeaderboardRanking[],
	userRankings: UserLeaderboardRankings,
	weeklyReadCount: LeaderboardRanking[],
	timeZoneName: string
}