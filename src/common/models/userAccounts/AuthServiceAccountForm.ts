import PushDeviceForm from './PushDeviceForm';

export default interface AuthServiceAccountForm {
	token: string,
	name: string,
	timeZoneName: string,
	pushDevice: PushDeviceForm
}