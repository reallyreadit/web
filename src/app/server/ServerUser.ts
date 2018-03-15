import User from '../common/User';
import UserAccount from '../../common/models/UserAccount';

export default class extends User {
	private _userAccount: UserAccount;
	constructor(userAccount: UserAccount) {
		super();
		this.setUserAccount(userAccount);
	}
	protected getUserAccount() {
		return this._userAccount;
	}
	protected setUserAccount(userAccount: UserAccount) {
		this._userAccount = userAccount;
	}
	protected clearUserAccount() {
		this._userAccount = null;
	}
	public getInitData() {
		return this._userAccount;
	}
}