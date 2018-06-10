import UserAccount from '../../common/models/UserAccount';
import EventEmitter from './EventEmitter';
import EventType from './EventType';

export default abstract class extends EventEmitter<{
	'signIn': {
		userAccount: UserAccount,
		eventType: EventType
	},
	'signOut': { eventType: EventType },
	'authChange': {
		userAccount: UserAccount | null,
		eventType: EventType
	},
	'update': {
		prevUserAccount: UserAccount,
		currUserAccount: UserAccount,
		eventType: EventType
	}
}> {
	protected abstract getUserAccount(): UserAccount;
	protected abstract setUserAccount(userAccount: UserAccount): void;
	protected abstract clearUserAccount(): void;
	public signIn(userAccount: UserAccount) {
		this.setUserAccount(userAccount);
		this.emitEvent('signIn', { userAccount, eventType: EventType.Original });
		this.emitEvent('authChange', { userAccount, eventType: EventType.Original });
	}
	public signOut() {
		this.clearUserAccount();
		this.emitEvent('signOut', { eventType: EventType.Original });
		this.emitEvent(
			'authChange',
			{
				userAccount: null,
				eventType: EventType.Original
			}
		);
	}
	public update(userAccount: UserAccount) {
		const prevUserAccount = this.getUserAccount();
		this.setUserAccount(userAccount);
		this.emitEvent('update', {
			prevUserAccount,
			currUserAccount: userAccount,
			eventType: EventType.Original
		});
	}
	public get userAccount() {
		return this.getUserAccount();
	}
	public get isSignedIn() {
		return !!this.getUserAccount();
	}
}