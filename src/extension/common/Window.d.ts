import PageParams from './PageParams';

declare global {
	interface Window {
		_getPageParams(urlId: string): PageParams,
		_standardBlockSelectors: string[]
	}
}