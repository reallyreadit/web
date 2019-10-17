import PushDeviceForm from './PushDeviceForm';

export default interface PasswordResetForm {
	token: string,
	password: string,
	pushDevice: PushDeviceForm
}