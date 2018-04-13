export enum SourceRuleAction {
	Default,
	Read,
	Ignore
}

export default interface SourceRule {
	id: number,
	hostname: string,
	path: string,
	priority: number,
	action: SourceRuleAction
}