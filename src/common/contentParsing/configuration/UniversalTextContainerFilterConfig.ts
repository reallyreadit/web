import UniversalContainerFilterConfig from './UniversalContainerFilterConfig';

export default interface UniversalTextContainerFilterConfig extends UniversalContainerFilterConfig {
	regexBlacklist: RegExp[],
	singleSentenceOpenerBlacklist: string[]
}