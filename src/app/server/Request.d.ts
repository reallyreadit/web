import SessionState from '../../common/models/SessionState';
import ServerApi from "./ServerApi";
import ChallengeState from '../../common/models/ChallengeState';

declare global {
	namespace Express {
		export interface Request {
			api: ServerApi,
			sessionState: SessionState
		}
	}
}