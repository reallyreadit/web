import ContextInitData from '../common/ContextInitData';

declare global {
	interface Window {
		_contextInitData: ContextInitData
	}
}