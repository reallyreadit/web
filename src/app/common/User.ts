import UserAccount from './api/models/UserAccount';
import EventEmitter from './EventEmitter';

export default class User extends EventEmitter<{
	'signIn': UserAccount,
	'signOut': void,
	'authChange': UserAccount,
	'update': {
		prevUserAccount: UserAccount,
		currUserAccount: UserAccount
	}
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
		this.emitEvent('authChange', userAccount);
	}
	public signOut() {
		this._userAccount = null;
		this.emitEvent('signOut', null);
		this.emitEvent('authChange', null);
	}
	public getUserAccount() {
		return this._userAccount;
	}
	public update(userAccount: UserAccount) {
		const prevUserAccount = this._userAccount;
		this._userAccount = userAccount;
		this.emitEvent('update', { prevUserAccount, currUserAccount: userAccount });
	}
}