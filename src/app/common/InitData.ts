import { InitData as ServerApiInitData } from './serverApi/ServerApi';
import UserAccount from '../../common/models/UserAccount';
import ClientType from './ClientType';
import NewReplyNotification from '../../common/models/NewReplyNotification';
import Location from '../../common/routing/Location';

export default interface InitData {
	clientType: ClientType,
	extensionId: string,
	initialLocation: Location,
	newReplyNotification: NewReplyNotification,
	serverApi: ServerApiInitData,
	userAccount: UserAccount,
	verifyCaptcha: boolean,
	version: number
}