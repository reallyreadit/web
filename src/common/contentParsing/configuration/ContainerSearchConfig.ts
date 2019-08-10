import UniversalContainerSearchConfig from './UniversalContainerSearchConfig';

export default interface ContainerSearchConfig extends UniversalContainerSearchConfig {
	attributeFullWordWhitelist: string[]
}