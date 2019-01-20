export default interface ParseResult {
	title: string,
	byline: string,
	dir: string,
	content: string,
	textContent: string,
	length: number,
	excerpt: string,
	siteName: string,
	rootElement: HTMLElement
}