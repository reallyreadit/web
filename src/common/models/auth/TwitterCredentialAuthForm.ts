import SignUpAnalyticsForm from '../analytics/SignUpAnalyticsForm';
import PushDeviceForm from '../userAccounts/PushDeviceForm';
import AuthServiceIntegration from './AuthServiceIntegration';

export default interface TwitterCredentialAuthForm {
	integrations: AuthServiceIntegration,
	oauthToken: string,
	oauthVerifier: string,
	analytics: SignUpAnalyticsForm,
	pushDevice: PushDeviceForm
}