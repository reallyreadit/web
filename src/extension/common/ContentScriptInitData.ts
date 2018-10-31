import ContentScriptConfig from './ContentScriptConfig';
import SourceRule from '../../common/models/SourceRule';

export default interface ContentScriptInitData {
	config: ContentScriptConfig,
	loadPage: boolean,
	parseMetadata: boolean,
	parseMode: 'analyze' | 'mutate',
	showOverlay: boolean,
	sourceRules: SourceRule[]
}