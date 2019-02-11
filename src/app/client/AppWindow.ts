import ReCaptchaV3 from './ReCaptchaV3';
import { IncomingMessageHandlers } from '../../common/WebViewMessagingContext';

declare global {
	interface AppWindow extends IncomingMessageHandlers {
		grecaptcha: ReCaptchaV3
	}
}