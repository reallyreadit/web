export enum SourceRuleAction {
	Default,
	Read,
	Ignore
}

interface SourceRule {
	id: string,
	hostname: string,
	path: string,
	priority: number,
	action: SourceRuleAction
}
export default SourceRule;