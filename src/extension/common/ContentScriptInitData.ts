import ContentScriptConfig from './ContentScriptConfig';
import SourceRule from '../../common/models/SourceRule';

interface ContentScriptInitData {
	config: ContentScriptConfig,
	sourceRules: SourceRule[],
	showOverlay: boolean
	loadPage: boolean
}
export default ContentScriptInitData;