import AlertEmailPreference from './AlertEmailPreference';

export default interface AlertPreference {
	email: AlertEmailPreference,
	extension: boolean,
	push: boolean,
}