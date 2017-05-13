import UserAccount from './api/models/UserAccount';
import EventEmitter from './EventEmitter';

export default class User extends EventEmitter<{
	'signIn': UserAccount,
	'signOut': UserAccount
}> {
	protected _userAccount: UserAccount;
	constructor(userAccount: UserAccount) {
		super();
		this._userAccount = userAccount;
	}
	public isSignedIn() {
		return !!this._userAccount;
	}
	public signIn(userAccount: UserAccount) {
		this._userAccount = userAccount;
		this.emitEvent('signIn', userAccount);
	}
	public signOut() {
		const userAccount = this._userAccount;
		this._userAccount = null;
		this.emitEvent('signOut', userAccount);
	}
	public getUserAccount() {
		return this._userAccount;
	}
}