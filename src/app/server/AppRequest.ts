import ServerApi from './ServerApi';
import ClientType from '../common/ClientType';
import UserAccount from '../../common/models/UserAccount';

declare global {
	interface AppRequest {
		api: ServerApi,
		clientType: ClientType,
		user: UserAccount
	}
}