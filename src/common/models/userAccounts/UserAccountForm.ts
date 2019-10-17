import PushDeviceForm from './PushDeviceForm';

export default interface UserAccountForm {
	name: string,
	email: string,
	password: string,
	captchaResponse: string,
	timeZoneName: string,
	marketingScreenVariant: number,
	referrerUrl: string,
	initialPath: string,
	pushDevice: PushDeviceForm
}