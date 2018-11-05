export default interface WeeklyReadingLeaderboards {
	reads: {
		name: string,
		readCount: number
	}[],
	words: {
		name: string,
		wordCount: number
	}[]
}