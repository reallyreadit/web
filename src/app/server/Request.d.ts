import SessionState from '../../common/models/SessionState';
import ServerApi from "./ServerApi";

declare global {
	namespace Express {
		export interface Request {
			api: ServerApi,
			sessionState: SessionState
		}
	}
}