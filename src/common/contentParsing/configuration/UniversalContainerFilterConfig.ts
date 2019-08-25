import ElementSelector from './ElementSelector';

export default interface UniversalContainerFilterConfig {
	attributeFullWordBlacklist: string[],
	attributeWordPartBlacklist: string[],
	blacklistSelectors: ElementSelector[],
}