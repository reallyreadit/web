import UserAccount from './api/models/UserAccount';
import EventEmitter from './EventEmitter';

export default class User extends EventEmitter<{
	'signIn': UserAccount,
	'signOut': UserAccount
}> {
	constructor(protected userAccount: UserAccount) {
		super();
	}
	public isSignedIn() {
		return this.userAccount !== undefined;
	}
	public signIn(userAccount: UserAccount) {
		this.userAccount = userAccount;
		this.emitEvent('signIn', userAccount);
	}
	public signOut() {
		const userAccount = this.userAccount;
		this.userAccount = undefined;
		this.emitEvent('signOut', userAccount);
	}
	public getUserAccount() {
		return this.userAccount;
	}
}