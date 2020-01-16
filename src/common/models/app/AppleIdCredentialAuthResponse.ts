import UserAccount from '../UserAccount';

export default interface AppleIdCredentialAuthResponse {
	authServiceToken?: string,
	user?: UserAccount	
}