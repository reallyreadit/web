import SignUpAnalyticsForm from '../analytics/SignUpAnalyticsForm';

export default interface TwitterBrowserAuthRequestTokenRequest {
	redirectPath: string,
	signUpAnalytics: SignUpAnalyticsForm
}