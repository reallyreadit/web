import ChallengeResponseAction from "./ChallengeResponseAction";

export default interface ChallengeResponse {
	id: number,
	challengeId: number,
	userAccountId: number,
	date: string,
	action: ChallengeResponseAction,
	timeZoneId: number,
	timeZoneName: string
}