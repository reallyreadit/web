import RequestData from '../common/api/RequestData';
import UserAccount from '../common/api/models/UserAccount';
import Endpoint from '../common/api/Endpoint';

declare global {
	interface Window {
		_apiEndpoint: Endpoint,
		_apiInitData: RequestData[],
		_userInitData: UserAccount,
		_extensionId: string
	}
}