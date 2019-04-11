import LazyScript from './LazyScript';
import { ContentParseResult, ParseMode } from '../../common/reading/parseDocumentContent';

declare global {
	interface ContentScriptWindow {
		contentParser: LazyScript<{
			parse: (mode: ParseMode) => ContentParseResult
		}>
	}
}