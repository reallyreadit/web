import PushDeviceForm from './PushDeviceForm';
import { DisplayTheme } from './DisplayPreference';
import SignUpAnalyticsForm from '../analytics/SignUpAnalyticsForm';

export default interface AuthServiceAccountForm {
	token: string,
	name: string,
	timeZoneName: string,
	theme: DisplayTheme,
	analytics?: SignUpAnalyticsForm,
	pushDevice: PushDeviceForm
}