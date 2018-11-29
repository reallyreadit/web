import CurrentStreakLeaderboardRow from "./CurrentStreakLeaderboardRow";
import ReadCountLeaderboardRow from "./ReadCountLeaderboardRow";

export default interface Leaderboards {
	currentStreak: CurrentStreakLeaderboardRow[],
	readCount: ReadCountLeaderboardRow[]
}