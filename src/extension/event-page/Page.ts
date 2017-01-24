interface Page {
	url: string,
	number: number,
	wordCount: number,
	readState: number[],
	percentComplete: number
}
export default Page;