import { InitData as ServerApiInitData } from './serverApi/ServerApi';
import UserAccount from '../../common/models/UserAccount';
import Environment from './Environment';
import NewReplyNotification from '../../common/models/NewReplyNotification';

export default interface InitData {
	environment: Environment,
	newReplyNotification: NewReplyNotification,
	path: string,
	serverApi: ServerApiInitData,
	userAccount: UserAccount,
	verifyCaptcha: boolean
}