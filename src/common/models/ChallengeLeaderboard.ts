export default interface ChallengeLeaderboard {
	winners: {
		name: string,
		dateAwarded: string
	}[],
	contenders: {
		name: string,
		day: number,
		level: number
	}[]
}