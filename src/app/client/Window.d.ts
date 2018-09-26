import { WebViewMessagingListeners } from './WebViewMessagingContext';
import InitData from '../common/InitData';

declare global {
	interface Window {
		initData: InitData,
		onReCaptchaLoaded: () => void,
		reallyreadit: WebViewMessagingListeners
	}
}