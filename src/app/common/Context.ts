import Api from './api/Api';
import Page from './Page';
import User from './User';
import Dialog from './Dialog';
import Router from 'react-router';
import Extension from './Extension';

interface Context {
	api: Api,
	page: Page,
	user: User,
	dialog: Dialog,
	router: Router.InjectedRouter,
	extension: Extension,
	environment: 'server' | 'browser'
}
export default Context;