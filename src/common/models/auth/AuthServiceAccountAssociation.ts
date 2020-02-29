import AuthServiceProvider from './AuthServiceProvider';
import AuthServiceIntegration from './AuthServiceIntegration';

export default interface AuthServiceAccountAssociation {
	dateAssociated: string,
	emailAddress: string,
	handle: string,
	identityId: number,
	integrations: AuthServiceIntegration,
	provider: AuthServiceProvider
}