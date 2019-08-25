import TranspositionConfig from './TranspositionConfig';
import PublisherContainerSearchConfig from './PublisherContainerSearchConfig';
import { LazyImageStrategy } from '../processLazyImages';
import PublisherContainerFilterConfig from './PublisherContainerFilterConfig';

export function findPublisherConfig(configs: PublisherConfig[], hostname: string) {
	return configs.find(config => hostname.endsWith(config.hostname));
}
export default interface PublisherConfig {
	hostname: string,
	contentSearchRootElementSelector?: string,
	transpositions?: TranspositionConfig[],
	textContainerSearch?: PublisherContainerSearchConfig,
	textContainerFilter?: PublisherContainerFilterConfig,
	imageContainerSearch?: PublisherContainerSearchConfig,
	imageContainerFilter?: PublisherContainerFilterConfig,
	imageStrategy?: LazyImageStrategy
}