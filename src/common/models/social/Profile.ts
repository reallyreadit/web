import LeaderboardBadge from '../LeaderboardBadge';

export default interface Profile {
	userName: string,
	leaderboardBadge: LeaderboardBadge,
	followers: string[]
}