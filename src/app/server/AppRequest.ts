import ServerApi from "./ServerApi";
import SessionState from "../../common/models/SessionState";

declare global {
	interface AppRequest {
		api: ServerApi,
		sessionState: SessionState
	}
}