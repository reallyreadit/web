export default interface AuthorProfile {
	name: string,
	slug: string,
	totalEarnings: number,
	totalPayouts: number,
	userName: string | null,
	donationRecipient: DonationRecipient | null
}

export interface DonationRecipient {
	name: string,
	website: string
}