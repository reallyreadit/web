import PushDeviceForm from './PushDeviceForm';
import SignUpAnalyticsForm from '../analytics/SignUpAnalyticsForm';
import { DisplayTheme } from './DisplayPreference';

export default interface UserAccountForm {
	name: string,
	email: string,
	password: string,
	captchaResponse: string,
	timeZoneName: string,
	theme: DisplayTheme,
	analytics: SignUpAnalyticsForm,
	pushDevice: PushDeviceForm
}