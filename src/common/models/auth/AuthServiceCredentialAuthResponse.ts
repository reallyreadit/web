import UserAccount from '../UserAccount';
import DisplayPreference from '../userAccounts/DisplayPreference';

export type AuthServiceCredentialAuthTokenResponse = {
	authServiceToken: string
};
export type AuthServiceCredientialAuthProfileResponse = {
	displayPreference: DisplayPreference,
	user: UserAccount
}
type AuthServiceCredentialAuthResponse = (
	AuthServiceCredentialAuthTokenResponse |
	AuthServiceCredientialAuthProfileResponse
);
export default AuthServiceCredentialAuthResponse;
export function isAuthServiceCredentialAuthTokenResponse(response: AuthServiceCredentialAuthResponse): response is AuthServiceCredentialAuthTokenResponse {
	return (response as AuthServiceCredentialAuthTokenResponse).authServiceToken != null;
}