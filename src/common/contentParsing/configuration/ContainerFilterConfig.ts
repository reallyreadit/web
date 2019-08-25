import UniversalContainerFilterConfig from './UniversalContainerFilterConfig';

export default interface ContainerFilterConfig extends UniversalContainerFilterConfig {
	attributeFullWordWhitelist: string[]
}