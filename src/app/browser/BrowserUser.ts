import User from '../common/User';
import UserAccount from '../../common/models/UserAccount';

export default class BrowserUser extends User {
	public signIn(userAccount: UserAccount) {
		super.signIn(userAccount);
		ga('set', 'userId', userAccount.id);
	}
	public signOut() {
		super.signOut();
		ga('set', 'userId', null);
	}
}