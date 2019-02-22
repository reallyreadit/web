import ServerApi from './ServerApi';
import SessionState from '../../common/models/SessionState';
import ClientType from '../common/ClientType';

declare global {
	interface AppRequest {
		api: ServerApi,
		clientType: ClientType,
		sessionState: SessionState
	}
}