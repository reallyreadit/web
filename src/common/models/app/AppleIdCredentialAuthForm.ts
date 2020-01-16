import AppleIdCredential from './AppleIdCredential';
import SignUpAnalyticsForm from '../userAccounts/SignUpAnalyticsForm';
import PushDeviceForm from '../userAccounts/PushDeviceForm';

export default interface AppleIdCredentialAuthForm extends AppleIdCredential {
	analytics: SignUpAnalyticsForm,
	pushDevice: PushDeviceForm
}