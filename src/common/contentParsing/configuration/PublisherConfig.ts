import TranspositionConfig from './TranspositionConfig';
import PublisherContainerSearchConfig from './PublisherContainerSearchConfig';
import { LazyImageStrategy } from '../processLazyImages';

export function findPublisherConfig(configs: PublisherConfig[], hostname: string) {
	return configs.find(config => hostname.endsWith(config.hostname));
}
export default interface PublisherConfig {
	hostname: string,
	contentSearchRootElementSelector?: string,
	transpositions?: TranspositionConfig[],
	textContainerSearch?: PublisherContainerSearchConfig,
	imageContainerSearch?: PublisherContainerSearchConfig,
	imageStrategy?: LazyImageStrategy
}