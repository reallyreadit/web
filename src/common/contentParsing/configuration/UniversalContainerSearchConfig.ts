export default interface UniversalContainerSearchConfig {
	nodeNameBlacklist: string[],
	attributeFullWordBlacklist: string[],
	attributeWordPartBlacklist: string[],
	classBlacklist: string[],
	itempropValueBlacklist: string[],
	descendantNodeNameBlacklist: string[]
}