import AuthServiceIntegration from './AuthServiceIntegration';

export default interface TwitterCredentialLinkForm {
	integrations: AuthServiceIntegration,
	oauthToken: string,
	oauthVerifier: string
}