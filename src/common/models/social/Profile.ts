import LeaderboardBadge from '../LeaderboardBadge';
import AuthorProfile from '../authors/AuthorProfile';

export default interface Profile {
	userName: string,
	isFollowed: boolean,
	leaderboardBadge: LeaderboardBadge,
	followeeCount: number,
	followerCount: number,
	authorProfile: AuthorProfile | null
}