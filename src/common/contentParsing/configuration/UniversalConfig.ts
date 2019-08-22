import ContainerSearchConfig from './UniversalContainerSearchConfig';
import TextContainerContentConfig from './TextContainerContentConfig';
import ImageContainerMetadataConfig from './ImageContainerMetadataConfig';
import TextContainerSearchConfig from './UniversalTextContainerSearchConfig';
import TextContainerSelectionConfig from './TextContainerSelectionConfig';
import ImageContainerContentConfig from './ImageContainerContentConfig';

export default interface UniversalConfig {
	textContainerSearch: TextContainerSearchConfig,
	textContainerContent: TextContainerContentConfig,
	imageContainerSearch: ContainerSearchConfig,
	imageContainerMetadata: ImageContainerMetadataConfig,
	imageContainerContent: ImageContainerContentConfig,
	textContainerSelection: TextContainerSelectionConfig,
	wordCountTraversalPathSearchLimitMultiplier: number
}