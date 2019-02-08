import ReCaptchaV3 from './ReCaptchaV3';

declare global {
	interface AppWindow {
		grecaptcha: ReCaptchaV3,
		postMessage: (jsonMessage: string) => void,
		sendResponse: (jsonCallbackResponse: string) => void
	}
}