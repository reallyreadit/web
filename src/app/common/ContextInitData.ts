import UserAccount from '../../common/models/UserAccount';
import { InitData as PageInitData } from './Page';
import { InitData as ApiInitData } from './api/Api';
import { InitData as EnvironmentInitData } from './Environment';
import ChallengeState from '../../common/models/ChallengeState';

export default interface ContextInitData {
	api: ApiInitData,
	captcha: boolean,
	user: UserAccount
}