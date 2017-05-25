import RequestData from '../common/api/RequestData';
import UserAccount from '../common/api/models/UserAccount';
import Endpoint from '../common/api/Endpoint';
import { InitData as PageInitData } from '../common/Page';

declare global {
	interface Window {
		_pageInitData: PageInitData,
		_apiEndpoint: Endpoint,
		_apiInitData: RequestData[],
		_userInitData: UserAccount,
		_extensionId: string
	}
}