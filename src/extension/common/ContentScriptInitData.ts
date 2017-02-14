import Source from './Source';
import ContentScriptConfig from './ContentScriptConfig';

interface ContentScriptInitData {
	source: Source,
	config: ContentScriptConfig,
	showOverlay: boolean
}
export default ContentScriptInitData;