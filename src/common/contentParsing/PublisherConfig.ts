import TranspositionRule from './TranspositionRule';

export default interface PublisherConfig {
	hostname: string,
	transpositions: TranspositionRule[],
	imageSearchAttributeBlacklist: string[],
	textSearchAttributeWhitelist: string[]
}