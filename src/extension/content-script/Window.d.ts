import ParseResult from '../common/ParseResult';

declare global {
	interface Window {
		_parse(): ParseResult
	}
}