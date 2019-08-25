import ContainerSearchConfig from './ContainerSearchConfig';

export default interface TextContainerSearchConfig extends ContainerSearchConfig {
	additionalContentNodeNameBlacklist: string[]
	additionalContentMaxDepthIncrease: number,
	additionalContentMaxDepthDecrease: number
}