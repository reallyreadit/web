import UserAccount from '../../common/models/UserAccount';
import { InitData as PageInitData } from './Page';
import { InitData as ApiInitData } from './api/Api';
import Environment from './Environment';

export default interface ContextInitData {
	api: ApiInitData,
	environment: Environment,
	extension: string,
	page: PageInitData,
	user: UserAccount
}