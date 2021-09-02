import AppApi, { ArticleReference } from '../common/AppApi';
import { ShareEvent } from '../../common/sharing/ShareEvent';
import UserAccount from '../../common/models/UserAccount';
import SignInEventType from '../../common/models/userAccounts/SignInEventType';
import WebAuthRequest from '../../common/models/app/WebAuthRequest';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';
import { SubscriptionProductsRequest } from '../../common/models/app/SubscriptionProducts';
import { SubscriptionPurchaseRequest } from '../../common/models/app/SubscriptionPurchase';

export default class extends AppApi {
	public displayPreferenceChanged(preference: DisplayPreference) {
		throw new Error('Operation not supported in server environment');
	}
	public getDeviceInfo() {
		return Promise.reject('Operation not supported in server environment');
	}
	public initialize(user?: UserAccount) {
		return Promise.reject('Operation not supported in server environment');
	}
	public installUpdate() {
		throw new Error('Operation not supported in server environment');
	}
	public openExternalUrl(url: string) {
		throw new Error('Operation not supported in server environment');
	}
	public openExternalUrlUsingSystem(url: string) {
		throw new Error('Operation not supported in server environment');
	}
	public openExternalUrlWithCompletionHandler(url: string) {
		return Promise.reject('Operation not supported in server environment');
	}
	public readArticle(reference: ArticleReference) {
		throw new Error('Operation not supported in server environment');
	}
	public requestAppleIdCredential() {
		throw new Error('Operation not supported in server environment');
	}
	public requestNotificationAuthorization() {
		return Promise.reject('Operation not supported in server environment');
	}
	public requestSubscriptionProducts(request: SubscriptionProductsRequest) {
		return Promise.reject('Operation not supported in server environment');
	}
	public requestSubscriptionPurchase(request: SubscriptionPurchaseRequest) {
		return Promise.reject('Operation not supported in server environment');
	}
	public requestSubscriptionReceipt() {
		return Promise.reject('Operation not supported in server environment');
	}
	public requestWebAuthentication(request: WebAuthRequest) {
		return Promise.reject('Operation not supported in server environment');
	}
	public share(data: ShareEvent) {
		return Promise.reject('Operation not supported in server environment');
	}
	public signIn(user: UserAccount, eventType: SignInEventType) {
		return Promise.reject('Operation not supported in server environment');
	}
	public signOut() {
		throw new Error('Operation not supported in server environment');
	}
	public syncAuthCookie(user?: UserAccount) {
		throw new Error('Operation not supported in server environment');
	}
}