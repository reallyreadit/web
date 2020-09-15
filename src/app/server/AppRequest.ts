import ServerApi from './ServerApi';
import ClientType from '../common/ClientType';
import { Route } from '../../common/routing/Route';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';

declare global {
	interface AppRequest {
		api: ServerApi,
		clientType: ClientType,
		matchedRoute?: Route<any, any>,
		userProfile: WebAppUserProfile
	}
}