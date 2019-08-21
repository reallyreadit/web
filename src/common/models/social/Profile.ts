import LeaderboardBadge from '../LeaderboardBadge';

export default interface Profile {
	userName: string,
	isFollowed: boolean,
	leaderboardBadge: LeaderboardBadge,
	followeeCount: number,
	followerCount: number
}