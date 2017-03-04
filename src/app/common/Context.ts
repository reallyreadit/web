import Api from './api/Api';
import PageTitle from './PageTitle';
import User from './User';
import Dialog from './Dialog';
import Router from 'react-router';
import Extension from './Extension';

interface Context {
	api: Api,
	pageTitle: PageTitle,
	user: User,
	dialog: Dialog,
	router: Router.InjectedRouter,
	extension: Extension,
	environment: 'server' | 'browser'
}
export default Context;