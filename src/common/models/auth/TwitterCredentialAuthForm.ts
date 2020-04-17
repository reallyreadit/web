import SignUpAnalyticsForm from '../analytics/SignUpAnalyticsForm';
import PushDeviceForm from '../userAccounts/PushDeviceForm';

export default interface TwitterCredentialAuthForm {
	oauthToken: string,
	oauthVerifier: string,
	analytics: SignUpAnalyticsForm,
	pushDevice: PushDeviceForm
}