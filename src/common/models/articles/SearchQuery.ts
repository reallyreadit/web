export default interface SearchQuery {
	authors: string[],
	sources: string[],
	tags: string[],
	minLength: number | null
	maxLength: number | null
}