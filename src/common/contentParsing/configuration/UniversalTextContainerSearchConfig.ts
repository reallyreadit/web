import UniversalContainerSearchConfig from './UniversalContainerSearchConfig';

export default interface UniversalTextContainerSearchConfig extends UniversalContainerSearchConfig {
	additionalContentNodeNameBlacklist: string[]
	additionalContentMaxDepthIncrease: number,
	additionalContentMaxDepthDecrease: number
}