import AppApi, { ArticleReference } from '../common/AppApi';
import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import SemanticVersion from '../../common/SemanticVersion';
import ShareData from '../../common/sharing/ShareData';
import DeviceInfo from '../../common/models/app/DeviceInfo';
import SerializedDeviceInfo from '../../common/models/app/SerializedDeviceInfo';
import UserAccount from '../../common/models/UserAccount';

export default class extends AppApi {
	private readonly _messagingContext: WebViewMessagingContext;
	private _deviceInfo: DeviceInfo = {
		appVersion: new SemanticVersion('0.0.0'),
		installationId: null,
		name: '',
		token: null
	};
	constructor(messagingContext: WebViewMessagingContext) {
		super();
		this._messagingContext = messagingContext;
		messagingContext.addListener(message => {
			switch (message.type) {
				case 'alertStatusUpdated':
					this.emitEvent('alertStatusUpdated', message.data);
					break;
				case 'articlePosted':
					this.emitEvent('articlePosted', message.data);
					break;
				case 'articleUpdated':
					this.emitEvent('articleUpdated', message.data);
					break;
				case 'commentPosted':
					this.emitEvent('commentPosted', message.data);
					break;
				case 'didBecomeActive':
					this.emitEvent('didBecomeActive', message.data);
					break;
				case 'deviceInfoUpdated':
					this.setDeviceInfo(message.data);	
					break;
				case 'loadUrl':
					this.emitEvent('loadUrl', message.data);
					break;
			}
		});
		messagingContext.sendMessage(
			{
				type: 'getDeviceInfo'
			},
			(deviceInfo: SerializedDeviceInfo) => {
				this.setDeviceInfo(deviceInfo);
			}
		);
		// legacy app < version 5.0.0
		messagingContext.sendMessage(
			{
				type: 'getVersion'
			},
			(version: string) => {
				this._deviceInfo.appVersion = new SemanticVersion(version);
			}
		);
	}
	private setDeviceInfo(deviceInfo: SerializedDeviceInfo) {
		this._deviceInfo = {
			...deviceInfo,
			appVersion: new SemanticVersion(deviceInfo.appVersion)
		};
	}
	public readArticle(reference: ArticleReference) {
		this._messagingContext.sendMessage({
			type: 'readArticle',
			data: reference
		});
	}
	public share(data: ShareData) {
		this._messagingContext.sendMessage({
			type: 'share',
			data
		});
	}
	public syncAuthCookie(user?: UserAccount) {
		this._messagingContext.sendMessage({
			type: 'syncAuthCookie',
			data: user
		});
	}
	public get appVersion() {
		return this._deviceInfo.appVersion;
	}
	public get deviceInfo() {
		return this._deviceInfo;
	}
}