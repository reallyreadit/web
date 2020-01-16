import PushDeviceForm from './PushDeviceForm';

export default interface SignInForm {
	authServiceToken: string,
	email: string,
	password: string,
	pushDevice: PushDeviceForm
}