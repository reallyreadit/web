import InitData from '../common/InitData';

declare global {
	interface AppWindow {
		initData: InitData,
		// iOS keyboard scroll bug
		isFocusedOnField: boolean,
		onReCaptchaLoaded: () => void
	}
}