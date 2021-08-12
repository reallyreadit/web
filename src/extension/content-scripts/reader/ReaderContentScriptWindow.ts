import LazyScript from './LazyScript';
import ParseResult from '../../../common/contentParsing/ParseResult';
import { ParserParams } from '../../../common/contentParsing/parseDocumentContent';

declare global {
	interface ReaderContentScriptWindow {
		contentParser: LazyScript<{
			parse: (params: ParserParams) => ParseResult,
			prune: (parseResult: ParseResult) => {
				contentRoot: HTMLElement,
				scrollRoot: HTMLElement
			}
		}>
	}
}