import UserAccount from '../../common/models/UserAccount';
import ClientType from './ClientType';
import RouteLocation from '../../common/routing/RouteLocation';
import HttpEndpoint from '../../common/HttpEndpoint';
import Exchange from './serverApi/Exchange';
import DeviceType from './DeviceType';

export default interface InitData {
	analyticsTrackingCode: string | null,
	apiServerEndpoint: HttpEndpoint,
	captchaSiteKey: string | null,
	clientType: ClientType,
	deviceType: DeviceType,
	extensionId: string,
	exchanges: Exchange[],
	initialLocation: RouteLocation,
	marketingScreenVariant: number,
	iosReferrerUrl: string,
	userAccount: UserAccount,
	version: string,
	webServerEndpoint: HttpEndpoint
}