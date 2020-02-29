import UserAccount from '../UserAccount';

export default interface AuthServiceCredentialAuthResponse {
	authServiceToken?: string,
	user?: UserAccount	
}