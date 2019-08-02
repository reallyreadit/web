import TranspositionConfig from './TranspositionConfig';

export default interface PublisherConfig {
	hostnameRegex: RegExp,
	transpositions: TranspositionConfig[],
	imageSearchAttributeBlacklist: string[]
}