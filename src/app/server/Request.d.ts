import UserAccount from '../common/api/models/UserAccount';
import { MatchState } from "@types/react-router/lib/match";
import ServerApi from "./ServerApi";

declare global {
	namespace Express {
		export interface Request {
			nextState: MatchState,
			api: ServerApi,
			userAccount: UserAccount
		}
	}
}