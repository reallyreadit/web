import ContentScriptConfig from './ContentScriptConfig';

interface ContentScriptInitData {
	config: ContentScriptConfig,
	showOverlay: boolean
	loadPage: boolean
}
export default ContentScriptInitData;