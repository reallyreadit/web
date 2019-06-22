import CurrentStreakLeaderboardRow from './CurrentStreakLeaderboardRow';
import ReadCountLeaderboardRow from './ReadCountLeaderboardRow';
import LongestReadLeaderboardRow from './LongestReadLeaderboardRow';
import ScoutLeaderboardRow from './ScoutLeaderboardRow';
import ScribeLeaderboardRow from './ScribeLeaderboardRow';
import UserLeaderboardRankings from './UserLeaderboardRankings';

export default interface Leaderboards {
	longestRead: LongestReadLeaderboardRow[],
	readCount: ReadCountLeaderboardRow[],
	scout: ScoutLeaderboardRow[],
	scribe: ScribeLeaderboardRow[],
	streak: CurrentStreakLeaderboardRow[],
	userRankings: UserLeaderboardRankings,
	weeklyReadCount: ReadCountLeaderboardRow[]
}