import SourceRule from '../../common/models/SourceRule';

export default interface ContentScriptInitData {
	loadPage: boolean,
	sourceRules: SourceRule[]
}