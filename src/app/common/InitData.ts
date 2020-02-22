import UserAccount from '../../common/models/UserAccount';
import ClientType from './ClientType';
import RouteLocation from '../../common/routing/RouteLocation';
import HttpEndpoint from '../../common/HttpEndpoint';
import Exchange from './serverApi/Exchange';
import AppReferral from './AppReferral';
import { DeviceType } from './DeviceType';

export default interface InitData {
	analyticsTrackingCode: string | null,
	apiServerEndpoint: HttpEndpoint,
	appReferral: AppReferral,
	captchaSiteKey: string | null,
	clientType: ClientType,
	deviceType: DeviceType,
	extensionId: string,
	exchanges: Exchange[],
	initialLocation: RouteLocation,
	marketingVariant: number,
	userAccount: UserAccount,
	version: string,
	webServerEndpoint: HttpEndpoint
}