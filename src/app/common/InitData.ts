import ClientType from './ClientType';
import RouteLocation from '../../common/routing/RouteLocation';
import HttpEndpoint from '../../common/HttpEndpoint';
import Exchange from './serverApi/Exchange';
import AppReferral from './AppReferral';
import { DeviceType } from '../../common/DeviceType';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';

export default interface InitData {
	analyticsTrackingCode: string | null,
	apiServerEndpoint: HttpEndpoint,
	appReferral: AppReferral,
	captchaSiteKey: string | null,
	clientType: ClientType,
	deviceType: DeviceType,
	exchanges: Exchange[],
	extensionVersion: string | null,
	initialLocation: RouteLocation,
	marketingVariant: number,
	userProfile: WebAppUserProfile | null,
	version: string,
	webServerEndpoint: HttpEndpoint
}