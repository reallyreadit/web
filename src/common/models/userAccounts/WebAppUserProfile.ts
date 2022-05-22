import UserAccount from '../UserAccount';
import DisplayPreference from './DisplayPreference';

export default interface WebAppUserProfile {
	displayPreference?: DisplayPreference,
	userAccount: UserAccount
}