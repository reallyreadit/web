import User from '../common/User';

export default class ServerUser extends User {
	public getInitData() {
		return this.userAccount;
	}
}