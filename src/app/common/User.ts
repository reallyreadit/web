import UserAccount from '../../common/models/UserAccount';
import EventEmitter from './EventEmitter';

export default abstract class extends EventEmitter<{
	'signIn': UserAccount,
	'signOut': void,
	'authChange': UserAccount,
	'update': {
		prevUserAccount: UserAccount,
		currUserAccount: UserAccount
	}
}> {
	constructor(userAccount: UserAccount) {
		super();
	}
	protected abstract getUserAccount(): UserAccount;
	protected abstract setUserAccount(userAccount: UserAccount): void;
	protected abstract clearUserAccount(): void;
	public signIn(userAccount: UserAccount) {
		this.setUserAccount(userAccount);
		this.emitEvent('signIn', userAccount);
		this.emitEvent('authChange', userAccount);
	}
	public signOut() {
		this.clearUserAccount();
		this.emitEvent('signOut', null);
		this.emitEvent('authChange', null);
	}
	public update(userAccount: UserAccount) {
		const prevUserAccount = this.getUserAccount();
		this.setUserAccount(userAccount);
		this.emitEvent('update', { prevUserAccount, currUserAccount: userAccount });
	}
	public get userAccount() {
		return this.getUserAccount();
	}
	public get isSignedIn() {
		return !!this.getUserAccount();
	}
}