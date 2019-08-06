import SerializedTranspositionRule from './SerializedTranspositionRule';

export default interface SerializedPublisherConfig {
	hostname: string,
	transpositions: SerializedTranspositionRule[],
	imageSearchAttributeBlacklist: string[],
	textSearchAttributeWhitelist: string[]
}