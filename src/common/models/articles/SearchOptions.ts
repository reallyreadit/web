import SearchOption from './SearchOption';

export default interface SearchOptions {
	authors: SearchOption[],
	sources: SearchOption[],
	tags: SearchOption[]
}