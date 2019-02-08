import InitData from '../common/InitData';
import ReCaptchaV3 from './ReCaptchaV3';

declare global {
	interface AppWindow {
		grecaptcha: ReCaptchaV3,
		initData: InitData,
		// iOS keyboard scroll bug
		isFocusedOnField: boolean,
		onReCaptchaLoaded: () => void,
		postMessage: (jsonMessage: string) => void,
		sendResponse: (jsonCallbackResponse: string) => void
	}
}