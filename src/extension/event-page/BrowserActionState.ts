import ReaderContentScriptTab from './ReaderContentScriptTab';
import UserArticle from '../../common/models/UserArticle';
import UserAccount from '../../common/models/UserAccount';

export default interface BrowserActionState {
	activeTab?: ReaderContentScriptTab,
	article?: UserArticle,
	debug: boolean,
	isAuthenticated: boolean,
	isOnHomePage: boolean,
	url: string | null,
	user?: UserAccount
}