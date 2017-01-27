import User from '../common/User';
import UserAccount from '../common/api/models/UserAccount';

export default class BrowserUser extends User {
	//sprivate _extensionId = 'ibdjhkiiiiifdgmdalkofacfnihpomkn';
	constructor(userAccount: UserAccount) {
		super(userAccount);
	}
	// private getSessionKey() {
	// 	return document.cookie.match(/(?:(?:^|.*;\s*)sessionKey\s*\=\s*([^;]*).*$)|^.*$/)[1];
	// }
	public signIn(userAccount: UserAccount) {
		const result = super.signIn(userAccount);
		// chrome.runtime.sendMessage(this._extensionId, {
		// 	type: 'signIn',
		// 	data: {
		// 		userAccount: this.getUserAccount(),
		// 		sessionKey: this.getSessionKey()
		// 	}
		// });
		return result;
	}
	public signOut() {
		const result = super.signOut();
		//chrome.runtime.sendMessage(this._extensionId, { type: 'signOut' });
		return result;
	}
}