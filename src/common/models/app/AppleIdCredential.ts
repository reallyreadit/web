export default interface AppleIdCredential {
	authorizationCode: string | null,
	email: string | null,
	identityToken: string | null,
	realUserStatus: 'likelyReal' | 'unknown' | 'unsupported',
	user: string
}