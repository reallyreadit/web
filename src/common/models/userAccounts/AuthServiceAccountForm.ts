import PushDeviceForm from './PushDeviceForm';
import { DisplayTheme } from './DisplayPreference';

export default interface AuthServiceAccountForm {
	token: string,
	name: string,
	timeZoneName: string,
	theme: DisplayTheme,
	pushDevice: PushDeviceForm
}