import AuthServiceProvider from './AuthServiceProvider';

export default interface AuthServiceAccountAssociation {
	dateAssociated: string,
	emailAddress: string,
	provider: AuthServiceProvider
}