import AuthServiceIntegration from './AuthServiceIntegration';
import SignUpAnalyticsForm from '../analytics/SignUpAnalyticsForm';

export default interface TwitterBrowserRequestForm {
	integrations: AuthServiceIntegration,
	redirectPath: string,
	signUpAnalytics: SignUpAnalyticsForm
}