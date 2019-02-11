import Page from '../../common/reading/Page';
import LazyScript from './LazyScript';
import { ContentParseResult, ParseMode } from '../../common/reading/parseDocumentContent';

declare global {
	interface ContentScriptWindow {
		contentParser: LazyScript<{
			parse: (mode: ParseMode) => ContentParseResult
		}>,
		userInterface: LazyScript<{
			construct: (page: Page) => void,
			destruct: () => void
		}>
	}
}