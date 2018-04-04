import ContextInitData from '../common/ContextInitData';
import { AppApi } from './WebViewMessagingContext';

declare global {
	interface Window {
		_contextInitData: ContextInitData,
		reallyreadit: AppApi
	}
}