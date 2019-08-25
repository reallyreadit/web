import ElementSelector from './ElementSelector';

export default interface PublisherContainerFilterConfig {
	attributeFullWordBlacklist?: string[],
	attributeFullWordWhitelist?: string[],
	blacklistSelectors?: ElementSelector[],
}