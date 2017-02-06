import Source from './Source';
import ContentScriptOptions from './ContentScriptOptions';

interface ContentScriptInitData {
	source: Source,
	options: ContentScriptOptions
}
export default ContentScriptInitData;