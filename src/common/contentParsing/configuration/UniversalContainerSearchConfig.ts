export default interface UniversalContainerSearchConfig {
	nodeNameBlacklist: string[],
	attributeFullWordBlacklist: string[],
	attributeWordPartBlacklist: string[],
	itempropValueBlacklist: string[],
	descendantNodeNameBlacklist: string[]
}