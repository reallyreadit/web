import EventEmitter from '../../common/EventEmitter';
import ShareData from '../../common/sharing/ShareData';
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
import { ErrorResponse } from '../../common/models/app/AppResult';
import { ProductsRequestError, PurchaseError, ReceiptRequestError, TransactionError } from '../../common/models/app/Errors';
import { Result } from '../../common/Result';
import { SubscriptionProductsRequest, SubscriptionProductsResponse } from '../../common/models/app/SubscriptionProducts';
import { SubscriptionPurchaseRequest, SubscriptionPurchaseResponse } from '../../common/models/app/SubscriptionPurchase';
import { SubscriptionReceiptResponse } from '../../common/models/app/SubscriptionReceipt';
import { AppleSubscriptionValidationResponse } from '../../common/models/subscriptions/AppleSubscriptionValidation';

export type ArticleReference = { slug: string } | { url: string }
export default abstract class extends EventEmitter<{
	'alertStatusUpdated': AlertStatus,
	'articlePosted': Post,
	'articleUpdated': ArticleUpdatedEvent,
	'authenticateAppleIdCredential': AppleIdCredential,
	'authServiceAccountLinked': AuthServiceAccountAssociation,
	'commentPosted': CommentThread,
	'commentUpdated': CommentThread,
	'didBecomeActive': AppActivationEvent,
	'displayPreferenceChanged': DisplayPreference,
	'loadUrl': string,
	'subscriptionPurchaseCompleted': Result<AppleSubscriptionValidationResponse, ErrorResponse<TransactionError>>
}> {
	public abstract displayPreferenceChanged(preference: DisplayPreference): void;
	public abstract getDeviceInfo(): Promise<DeviceInfo>;
	public abstract initialize(user?: UserAccount): Promise<DeviceInfo>;
	public abstract openExternalUrl(url: string): void;
	public abstract readArticle(reference: ArticleReference): void;
	public abstract requestAppleIdCredential(): void;
	public abstract requestNotificationAuthorization(): Promise<NotificationAuthorizationRequestResult>;
	public abstract requestSubscriptionProducts(request: SubscriptionProductsRequest): Promise<Result<SubscriptionProductsResponse, ErrorResponse<ProductsRequestError>>>;
	public abstract requestSubscriptionPurchase(request: SubscriptionPurchaseRequest): Promise<Result<SubscriptionPurchaseResponse, ErrorResponse<PurchaseError>>>;
	public abstract requestSubscriptionReceipt(): Promise<Result<SubscriptionReceiptResponse, ErrorResponse<ReceiptRequestError>>>;
	public abstract requestWebAuthentication(request: WebAuthRequest): Promise<WebAuthResponse>;
	public abstract share(data: ShareData): Promise<ShareResult>;
	public abstract signIn(user: UserAccount, eventType: SignInEventType): Promise<SignInEventResponse>;
	public abstract signOut(): void;
	public abstract syncAuthCookie(user?: UserAccount): void;
	public abstract get deviceInfo(): DeviceInfo;
}