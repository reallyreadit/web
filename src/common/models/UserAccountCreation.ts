export default interface UserAccountCreation {
	id: number,
	name: string,
	dateCreated: string,
	timeZoneName: string,
	clientMode: string,
	marketingVariant: number,
	referrerUrl: string | null,
	initialPath: string | null,
	currentPath: string | null,
	action: string | null
}