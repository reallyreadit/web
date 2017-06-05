import SessionState from '../common/api/models/SessionState';
import { MatchState } from "@types/react-router/lib/match";
import ServerApi from "./ServerApi";

declare global {
	namespace Express {
		export interface Request {
			nextState: MatchState,
			api: ServerApi,
			sessionState: SessionState
		}
	}
}