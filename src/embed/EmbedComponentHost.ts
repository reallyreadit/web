import { createUrl } from '../common/HttpEndpoint';
import ComponentHost from '../common/shadowDom/ComponentHost';

export default abstract class EmbedComponentHost<Services, State> extends ComponentHost<Services, State> {
	protected getStylesheetUrl() {
		return createUrl(window.reallyreadit.embed.config.staticServer, `/embed/bundle-${window.reallyreadit.embed.config.version.embed}.css`);
	}
}