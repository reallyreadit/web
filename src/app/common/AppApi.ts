import EventEmitter from '../../common/EventEmitter';
import { ShareEvent } from '../../common/sharing/ShareEvent';
import CommentThread from '../../common/models/CommentThread';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import Post from '../../common/models/social/Post';
import DeviceInfo from '../../common/models/app/DeviceInfo';
import AppActivationEvent from '../../common/models/app/AppActivationEvent';
import UserAccount from '../../common/models/UserAccount';
import AlertStatus from '../../common/models/app/AlertStatus';
import AppleIdCredential from '../../common/models/app/AppleIdCredential';
import NotificationAuthorizationRequestResult from '../../common/models/app/NotificationAuthorizationRequestResult';
import ShareResult from '../../common/models/app/ShareResult';
import SignInEventType from '../../common/models/userAccounts/SignInEventType';
import SignInEventResponse from '../../common/models/app/SignInEventResponse';
import WebAuthResponse from '../../common/models/app/WebAuthResponse';
import WebAuthRequest from '../../common/models/app/WebAuthRequest';
import AuthServiceAccountAssociation from '../../common/models/auth/AuthServiceAccountAssociation';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';
import { Result } from '../../common/Result';
import { SubscriptionProductsRequest, SubscriptionProductsResponse } from '../../common/models/app/SubscriptionProducts';
import { SubscriptionPurchaseRequest, SubscriptionPurchaseResponse } from '../../common/models/app/SubscriptionPurchase';
import { SubscriptionReceiptResponse } from '../../common/models/app/SubscriptionReceipt';
import { AppleSubscriptionValidationResponse } from '../../common/models/subscriptions/AppleSubscriptionValidation';
import { ProblemDetails } from '../../common/ProblemDetails';
import { ExternalUrlCompletionEvent } from '../../common/models/app/ExternalUrlCompletionEvent';
import { AppPlatform } from '../../common/AppPlatform';
import SemanticVersion from '../../common/SemanticVersion';
import { UpdateAvailableEvent } from '../../common/models/app/UpdateAvailableEvent';
import UserArticle from '../../common/models/UserArticle';

export type ArticleReference = { slug: string } | { url: string }
export interface ArticleStarredEvent {
	article: UserArticle
}
export default abstract class extends EventEmitter<{
	'alertStatusUpdated': AlertStatus,
	'articlePosted': Post,
	'articleStarred': ArticleStarredEvent,
	'articleUpdated': ArticleUpdatedEvent,
	'authenticateAppleIdCredential': AppleIdCredential,
	'authServiceAccountLinked': AuthServiceAccountAssociation,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'didBecomeActive': AppActivationEvent,
	'displayPreferenceChanged': DisplayPreference,
	'loadUrl': string,
	'openSubscriptionPrompt': void,
	'subscriptionPurchaseCompleted': Result<AppleSubscriptionValidationResponse, ProblemDetails>,
	'updateAvailable': UpdateAvailableEvent
}> {
	protected _deviceInfo: DeviceInfo;
	constructor(
		params: {
			platform: AppPlatform
		}
	) {
		super();
		this._deviceInfo = {
			appPlatform: params.platform,
			appVersion: new SemanticVersion('0.0.0'),
			installationId: null,
			name: '',
			token: null
		};
	}
	public abstract displayPreferenceChanged(preference: DisplayPreference): void;
	public abstract getDeviceInfo(): Promise<DeviceInfo>;
	public abstract initialize(user?: UserAccount): Promise<DeviceInfo>;
	public abstract installUpdate(): void;
	public abstract openExternalUrl(url: string): void;
	public abstract openExternalUrlUsingSystem(url: string): void;
	public abstract openExternalUrlWithCompletionHandler(url: string): Promise<ExternalUrlCompletionEvent>;
	public abstract readArticle(reference: ArticleReference): void;
	public abstract requestAppleIdCredential(): void;
	public abstract requestNotificationAuthorization(): Promise<NotificationAuthorizationRequestResult>;
	public abstract requestSubscriptionProducts(request: SubscriptionProductsRequest): Promise<Result<SubscriptionProductsResponse, ProblemDetails>>;
	public abstract requestSubscriptionPurchase(request: SubscriptionPurchaseRequest): Promise<Result<SubscriptionPurchaseResponse, ProblemDetails>>;
	public abstract requestSubscriptionReceipt(): Promise<Result<SubscriptionReceiptResponse, ProblemDetails>>;
	public abstract requestWebAuthentication(request: WebAuthRequest): Promise<WebAuthResponse>;
	public abstract share(data: ShareEvent): Promise<ShareResult>;
	public abstract signIn(user: UserAccount, eventType: SignInEventType): Promise<SignInEventResponse>;
	public abstract signOut(): void;
	public abstract syncAuthCookie(user?: UserAccount): void;
	public get deviceInfo() {
		return this._deviceInfo;
	}
}