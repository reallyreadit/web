import AuthServiceProvider from './AuthServiceProvider';

export default interface AuthServiceAccountAssociation {
	dateAssociated: string,
	emailAddress: string,
	handle: string,
	identityId: number,
	provider: AuthServiceProvider
}