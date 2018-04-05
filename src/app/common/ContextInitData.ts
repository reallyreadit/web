import UserAccount from '../../common/models/UserAccount';
import { InitData as PageInitData } from './Page';
import { InitData as ApiInitData } from './api/Api';
import { InitData as EnvironmentInitData } from './Environment';

export default interface ContextInitData {
	api: ApiInitData,
	environment: EnvironmentInitData,
	page: PageInitData,
	user: UserAccount
}