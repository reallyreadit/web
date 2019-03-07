import ReCaptchaV3 from "./ReCaptchaV3";

declare global {
	interface Window {
		grecaptcha: ReCaptchaV3,
		onReCaptchaLoaded: () => void,
	}
}