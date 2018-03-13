import User from '../common/User';
import UserAccount from '../../common/models/UserAccount';
import ObjectStore from '../../common/webStorage/ObjectStore';

export default class extends User {
	private readonly _userStore: ObjectStore<UserAccount | null>;
	constructor(userAccount: UserAccount) {
		super(userAccount);
		this._userStore = new ObjectStore<UserAccount | null>('userAccount', null);
		this._userStore.addEventListener((prevUserAccount, currUserAccount) => {
			if (prevUserAccount && currUserAccount) {
				this.emitEvent('update', { prevUserAccount, currUserAccount });
			} else if (!prevUserAccount) {
				this.emitEvent('signIn', currUserAccount);
				this.emitEvent('authChange', currUserAccount);
			} else {
				this.emitEvent('signOut', null);
				this.emitEvent('authChange', null);
			}
		});
		this.setUserAccount(userAccount);
	}
	protected getUserAccount() {
		return this._userStore.get();
	}
	protected setUserAccount(userAccount: UserAccount) {
		this._userStore.set(userAccount);
	}
	protected clearUserAccount() {
		this._userStore.clear();
	}
	public signIn(userAccount: UserAccount) {
		super.signIn(userAccount);
		ga('set', 'userId', userAccount.id);
	}
	public signOut() {
		super.signOut();
		ga('set', 'userId', null);
	}
}