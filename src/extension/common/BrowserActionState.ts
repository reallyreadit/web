import ContentScriptTab from './ContentScriptTab';
import UserArticle from '../../common/models/UserArticle';
import UserAccount from '../../common/models/UserAccount';

export default interface BrowserActionState {
	activeTab?: ContentScriptTab,
	article?: UserArticle,
	debug: boolean,
	isAuthenticated: boolean,
	isOnHomePage: boolean,
	url: string | null,
	user?: UserAccount
}