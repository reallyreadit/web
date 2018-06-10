import User from '../common/User';
import UserAccount from '../../common/models/UserAccount';
import ObjectStore from '../../common/webStorage/ObjectStore';
import EventType from '../common/EventType';

export default class extends User {
	private readonly _userStore: ObjectStore<UserAccount | null>;
	constructor(userAccount: UserAccount) {
		super();
		this._userStore = new ObjectStore<UserAccount | null>('userAccount', null);
		this._userStore.addEventListener((prevUserAccount, currUserAccount) => {
			if (prevUserAccount && currUserAccount) {
				this.emitEvent('update', { prevUserAccount, currUserAccount, eventType: EventType.Sync });
			} else if (!prevUserAccount) {
				this.emitEvent('signIn', {
					userAccount: currUserAccount,
					eventType: EventType.Sync
				});
				this.emitEvent('authChange', {
					userAccount: currUserAccount,
					eventType: EventType.Sync
				});
			} else {
				this.emitEvent('signOut', { eventType: EventType.Sync });
				this.emitEvent('authChange', {
					userAccount: null,
					eventType: EventType.Sync
				});
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