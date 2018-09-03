import ContentScriptConfig from './ContentScriptConfig';
import SourceRule from '../../common/models/SourceRule';

export default interface ContentScriptInitData {
	config: ContentScriptConfig,
	sourceRules: SourceRule[],
	showOverlay: boolean,
	parseMode: 'analyze' | 'mutate',
	loadPage: boolean
}