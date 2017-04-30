interface ParseResult {
	url: string,
	number?: number,
	wordCount?: number,
	readableWordCount?: number,
	article: {
		title: string,
		source: {
			name?: string,
			url?: string
		},
		datePublished?: string,
		dateModified?: string,
		authors: {
			name?: string,
			url?: string
		}[],
		section?: string,
		description?: string,
		tags: string[],
		pageLinks: {
			number: number,
			url: string
		}[]
	}
}
export default ParseResult;