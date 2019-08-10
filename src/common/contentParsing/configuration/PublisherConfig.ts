import TranspositionConfig from './TranspositionConfig';
import PublisherContainerSearchConfig from './PublisherContainerSearchConfig';

export default interface PublisherConfig {
	hostname: string,
	contentSearchRootElementSelector?: string,
	transpositions?: TranspositionConfig[],
	textContainerSearch?: PublisherContainerSearchConfig,
	imageContainerSearch?: PublisherContainerSearchConfig
}