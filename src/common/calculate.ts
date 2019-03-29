export function calculateEstimatedReadTime(wordCount: number) {
	return Math.max(1, Math.floor(wordCount / 184));
}