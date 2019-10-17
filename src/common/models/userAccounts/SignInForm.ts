import PushDeviceForm from './PushDeviceForm';

export default interface SignInForm {
	email: string,
	password: string,
	pushDevice: PushDeviceForm
}