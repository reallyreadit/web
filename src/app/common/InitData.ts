import UserAccount from '../../common/models/UserAccount';
import ClientType from './ClientType';
import NewReplyNotification from '../../common/models/NewReplyNotification';
import RouteLocation from '../../common/routing/RouteLocation';
import HttpEndpoint from '../../common/HttpEndpoint';
import Exchange from './serverApi/Exchange';

export default interface InitData {
	apiServerEndpoint: HttpEndpoint,
	captchaSiteKey: string | null,
	clientType: ClientType,
	extensionId: string,
	exchanges: Exchange[],
	initialLocation: RouteLocation,
	newReplyNotification: NewReplyNotification,
	userAccount: UserAccount,
	version: number,
	webServerEndpoint: HttpEndpoint
}