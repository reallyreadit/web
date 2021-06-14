export interface PayoutAccount {
	payoutsEnabled: boolean
}
export interface PayoutAccountResponse {
	payoutAccount: PayoutAccount | null
}
export enum PayoutAccountOnboardingLinkRequestResponseType {
	ReadyForOnboarding = 1,
	OnboardingCompleted = 2
}
export type PayoutAccountOnboardingLinkRequestResponse = {
	type: PayoutAccountOnboardingLinkRequestResponseType.OnboardingCompleted,
	payoutAccount: PayoutAccount | null
} | {
	type: PayoutAccountOnboardingLinkRequestResponseType.ReadyForOnboarding,
	onboardingUrl: string
};
export interface PayoutAccountLoginLinkRequestResponse {
	loginUrl: string
}