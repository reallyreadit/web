import { WebViewMessagingListeners } from './WebViewMessagingContext';
import InitData from '../common/InitData';
import ReCaptchaV3 from './ReCaptchaV3';

declare global {
	interface Window {
		grecaptcha: ReCaptchaV3,
		initData: InitData,
		onReCaptchaLoaded: () => void,
		reallyreadit: WebViewMessagingListeners,
		webkit: {
			messageHandlers: {
				reallyreadit: {
					postMessage: (message: any) => void
				}
			}
		}
	}
}