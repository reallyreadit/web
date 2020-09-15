import UserAccount from '../UserAccount';
import DisplayPreference from '../userAccounts/DisplayPreference';

export default interface AuthServiceCredentialAuthResponse {
	authServiceToken?: string,
	user?: UserAccount,
	displayPreference?: DisplayPreference
}