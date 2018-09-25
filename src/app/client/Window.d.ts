import { WebViewMessagingListeners } from './WebViewMessagingContext';

declare global {
	interface Window {
		reallyreadit: WebViewMessagingListeners,
		onReCaptchaLoaded: () => void
	}
}