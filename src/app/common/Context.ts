import Api from './api/Api';
import Page from './Page';
import User from './User';
import { RouterChildContext } from 'react-router';
import Extension from './Extension';

interface Context extends RouterChildContext<{}> {
	api: Api,
	page: Page,
	user: User,
	extension: Extension,
	environment: 'server' | 'browser'
}
export default Context;