import ComponentHost from '../../../common/shadowDom/ComponentHost';

export default abstract class ExtensionComponentHost<Services, State> extends ComponentHost<Services, State> {
	protected getStylesheetUrl() {
		return chrome.runtime.getURL('/content-scripts/reader/bundle.css');
	}
}