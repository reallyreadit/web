import Api from './api/Api';
import PageTitle from './PageTitle';
import User from './User';
import Dialog from './Dialog';

interface Context {
	api: Api,
	pageTitle: PageTitle,
	user: User,
	dialog: Dialog
}
export default Context;