import ImageContainerMetadataConfig from './ImageContainerMetadataConfig';
import TextContainerSelectionConfig from './TextContainerSelectionConfig';
import ImageContainerContentConfig from './ImageContainerContentConfig';
import TextContainerFilterConfig from './TextContainerFilterConfig';
import ContainerSearchConfig from './ContainerSearchConfig';
import TextContainerSearchConfig from './TextContainerSearchConfig';
import UniversalContainerFilterConfig from './UniversalContainerFilterConfig';

export default interface UniversalConfig {
	textContainerSearch: TextContainerSearchConfig,
	textContainerFilter: TextContainerFilterConfig,
	imageContainerSearch: ContainerSearchConfig,
	imageContainerFilter: UniversalContainerFilterConfig,
	imageContainerMetadata: ImageContainerMetadataConfig,
	imageContainerContent: ImageContainerContentConfig,
	textContainerSelection: TextContainerSelectionConfig,
	wordCountTraversalPathSearchLimitMultiplier: number
}