import { InitData as ServerApiInitData } from './serverApi/ServerApi';
import UserAccount from '../../common/models/UserAccount';
import ClientType from './ClientType';
import NewReplyNotification from '../../common/models/NewReplyNotification';
import Location from '../../common/routing/Location';
import ChallengeState from '../../common/models/ChallengeState';

export default interface InitData {
	challengeState: ChallengeState,
	clientType: ClientType,
	extensionId: string,
	initialLocation: Location,
	newReplyNotification: NewReplyNotification,
	serverApi: ServerApiInitData,
	userAccount: UserAccount,
	verifyCaptcha: boolean
}