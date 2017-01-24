import ContentPageMetadata from './ContentPageMetadata';

declare global {
	interface Window {
		_getContentPageMetadata(): ContentPageMetadata
	}
}