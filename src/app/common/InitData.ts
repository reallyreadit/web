import ClientType from './ClientType';
import RouteLocation from '../../common/routing/RouteLocation';
import HttpEndpoint from '../../common/HttpEndpoint';
import Exchange from './serverApi/Exchange';
import AppReferral from './AppReferral';
import { DeviceType } from '../../common/DeviceType';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';

export default interface InitData {
	apiServerEndpoint: HttpEndpoint,
	appReferral: AppReferral,
	clientType: ClientType,
	deviceType: DeviceType,
	exchanges: Exchange[],
	extensionVersion: string | null,
	initialLocation: RouteLocation,
	userProfile: WebAppUserProfile | null,
	version: string,
	webServerEndpoint: HttpEndpoint
}