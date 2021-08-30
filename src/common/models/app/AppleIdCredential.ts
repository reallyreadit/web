import { AppleClient } from './AppleClient';

export default interface AppleIdCredential {
	authorizationCode: string | null,
	email: string | null,
	identityToken: string | null,
	realUserStatus: 'likelyReal' | 'unknown' | 'unsupported',
	user: string,
	// Allow for optional client override for use in non-iOS app environments.
	client?: AppleClient
}