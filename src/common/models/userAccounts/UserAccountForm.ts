import PushDeviceForm from './PushDeviceForm';
import SignUpAnalyticsForm from '../analytics/SignUpAnalyticsForm';

export default interface UserAccountForm {
	name: string,
	email: string,
	password: string,
	captchaResponse: string,
	timeZoneName: string,
	analytics: SignUpAnalyticsForm,
	pushDevice: PushDeviceForm
}