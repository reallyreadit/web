import Page from '../../common/reading/Page';
import LazyScript from './LazyScript';
import { ContentElement, ParseMode } from '../../common/reading/parseDocumentContent';

declare global {
	interface ContentScriptWindow {
		contentParser: LazyScript<{
			parse: (mode: ParseMode) => {
				excerpt: string,
				elements: ContentElement[],
				wordCount: number
			}
		}>,
		userInterface: LazyScript<{
			construct: (page: Page) => void,
			destruct: () => void
		}>
	}
}