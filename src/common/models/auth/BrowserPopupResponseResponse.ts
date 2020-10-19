import WebAppUserProfile from '../userAccounts/WebAppUserProfile';
import AuthenticationError from './AuthenticationError';
import AuthServiceAccountAssociation from './AuthServiceAccountAssociation';

export default interface BrowserPopupResponseResponse {
	association: AuthServiceAccountAssociation | null,
	authServiceToken: string | null,
	error: AuthenticationError | null,
	userProfile: WebAppUserProfile | null
}