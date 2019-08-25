import ContainerFilterConfig from './ContainerFilterConfig';

export default interface TextContainerFilterConfig extends ContainerFilterConfig {
	regexBlacklist: RegExp[],
	singleSentenceOpenerBlacklist: string[]
}