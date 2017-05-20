import Api from './api/Api';
import Page from './Page';
import User from './User';
import Router from 'react-router';
import Extension from './Extension';

interface Context {
	api: Api,
	page: Page,
	user: User,
	router: Router.InjectedRouter,
	extension: Extension,
	environment: 'server' | 'browser'
}
export default Context;