import Source from './Source';
import ContentScriptConfig from './ContentScriptConfig';

interface ContentScriptInitData {
	source: Source,
	config: ContentScriptConfig
}
export default ContentScriptInitData;