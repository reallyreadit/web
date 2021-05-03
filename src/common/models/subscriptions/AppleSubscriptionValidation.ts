import { SubscriptionStatus } from "./SubscriptionStatus";

export interface AppleSubscriptionValidationRequest {
	base64EncodedReceipt: string
}
export enum AppleSubscriptionValidationResponseType {
	AssociatedWithCurrentUser = 1,
	AssociatedWithAnotherUser = 2,
	EmptyReceipt = 3
}
export type AppleSubscriptionValidationResponse = (
	{
		type: AppleSubscriptionValidationResponseType.AssociatedWithCurrentUser,
		subscriptionStatus: SubscriptionStatus
	} |
	{
		type: AppleSubscriptionValidationResponseType.AssociatedWithAnotherUser,
		subscribedUsername: string
	} | {
		type: AppleSubscriptionValidationResponseType.EmptyReceipt
	}
);