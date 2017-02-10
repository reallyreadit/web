import ParseResult from './ParseResult';

declare global {
	interface Window {
		_parse(): ParseResult
	}
}