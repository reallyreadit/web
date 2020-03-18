import LazyScript from './LazyScript';
import ParseResult from '../../../common/contentParsing/ParseResult';

declare global {
	interface ReaderContentScriptWindow {
		contentParser: LazyScript<{
			parse: () => ParseResult,
			prune: (parseResult: ParseResult) => void
		}>
	}
}