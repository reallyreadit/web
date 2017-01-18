import PageParams from './PageParams';

declare global {
	interface Window {
		_getPageParams(url: string): PageParams,
		_standardBlockSelectors: string[]
	}
}