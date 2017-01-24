interface ContentScriptOptions {
	// number of milliseconds it takes to read a word
	wordReadRate: number,
	// number of milliseconds between block offset updates (in case an ad or other element
	// expands/collapses and shifts page content)
	pageOffsetUpdateRate: number,
	readStateCommitRate: number,
	urlCheckRate: number
}
export default ContentScriptOptions;