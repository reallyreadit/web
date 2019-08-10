export default interface ImageContainerMetadataConfig {
	captionSelectors: string[],
	creditSelectors: string[],
	imageWrapperAttributeWordParts: string[],
	contentRegexBlacklist: RegExp[],
	contentRegexWhitelist: RegExp[]
}