import ReCaptchaV3 from "../../common/captcha/ReCaptchaV3";

declare global {
	interface Window {
		grecaptcha: ReCaptchaV3,
		onReCaptchaLoaded: () => void,
	}
}