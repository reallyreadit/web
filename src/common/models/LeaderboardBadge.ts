enum LeaderboardBadge {
	None = 0,
	LongestRead = 1 << 0,
	ReadCount = 1 << 1,
	Scout = 1 << 2,
	Scribe = 1 << 3,
	Streak = 1 << 4,
	WeeklyReadCount = 1 << 5
};
export default LeaderboardBadge;