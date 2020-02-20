import UserAccount from '../../common/models/UserAccount';
import ClientType from './ClientType';
import RouteLocation from '../../common/routing/RouteLocation';
import HttpEndpoint from '../../common/HttpEndpoint';
import Exchange from './serverApi/Exchange';
import AppReferral from './AppReferral';

export default interface InitData {
	analyticsTrackingCode: string | null,
	apiServerEndpoint: HttpEndpoint,
	appReferral: AppReferral,
	captchaSiteKey: string | null,
	clientType: ClientType,
	extensionId: string,
	exchanges: Exchange[],
	initialLocation: RouteLocation,
	isIosDevice: boolean,
	marketingVariant: number,
	userAccount: UserAccount,
	version: string,
	webServerEndpoint: HttpEndpoint
}