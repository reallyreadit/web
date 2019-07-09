export default interface UserAccountCreation {
	id: number,
	name: string,
	dateCreated: string,
	timeZoneName: string,
	clientMode: string,
	marketingScreenVariant: number,
	referrerUrl: string | null,
	initialPath: string | null
}