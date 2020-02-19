import ServerApi from './ServerApi';
import ClientType from '../common/ClientType';
import UserAccount from '../../common/models/UserAccount';
import { Route } from '../../common/routing/Route';

declare global {
	interface AppRequest {
		api: ServerApi,
		clientType: ClientType,
		matchedRoute?: Route<any, any>,
		user: UserAccount
	}
}