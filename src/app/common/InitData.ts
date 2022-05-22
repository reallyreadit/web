import ClientType from './ClientType';
import RouteLocation from '../../common/routing/RouteLocation';
import HttpEndpoint from '../../common/HttpEndpoint';
import Exchange from './serverApi/Exchange';
import AppReferral from './AppReferral';
import { DeviceType } from '../../common/DeviceType';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import { AppPlatform } from '../../common/AppPlatform';

type CommonInitData = {
	apiServerEndpoint: HttpEndpoint,
	deviceType: DeviceType,
	exchanges: Exchange[],
	initialLocation: RouteLocation,
	staticServerEndpoint: HttpEndpoint,
	userProfile: WebAppUserProfile | null,
	version: string,
	webServerEndpoint: HttpEndpoint
};
type AppInitData = CommonInitData & {
	appReferral: AppReferral,
	appPlatform: AppPlatform,
	clientType: ClientType.App
};
type BrowserInitData = CommonInitData & {
	clientType: ClientType.Browser,
	extensionVersion: string | null
};
type InitData = AppInitData | BrowserInitData;
export default InitData;