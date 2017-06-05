import UserAccount from '../common/api/models/UserAccount';
import { InitData as PageInitData } from '../common/Page';
import { InitData as ApiInitData } from '../common/api/Api';

declare global {
	interface Window {
		_contextInitData: {
			api: ApiInitData,
			extension: string,
			page: PageInitData,
			user: UserAccount
		}
	}
}