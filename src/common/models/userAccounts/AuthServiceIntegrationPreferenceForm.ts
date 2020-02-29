import AuthServiceIntegration from '../auth/AuthServiceIntegration';

export default interface AuthServiceIntegrationPreferenceForm {
	identityId: number,
	integration: AuthServiceIntegration
}