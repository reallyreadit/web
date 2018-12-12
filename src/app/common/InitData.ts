import { InitData as ServerApiInitData } from './serverApi/ServerApi';
import UserAccount from '../../common/models/UserAccount';
import ClientType from './ClientType';
import NewReplyNotification from '../../common/models/NewReplyNotification';
import RouteLocation from '../../common/routing/RouteLocation';

export default interface InitData {
	captchaSiteKey: string | null,
	clientType: ClientType,
	extensionId: string,
	initialLocation: RouteLocation,
	newReplyNotification: NewReplyNotification,
	serverApi: ServerApiInitData,
	userAccount: UserAccount,
	version: number
}