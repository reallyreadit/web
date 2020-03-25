import ReaderContentScriptTab from './ReaderContentScriptTab';
import UserArticle from '../../common/models/UserArticle';

export default interface BrowserActionState {
	activeTab?: ReaderContentScriptTab,
	article?: UserArticle,
	debug: boolean,
	isAuthenticated: boolean,
	isOnHomePage: boolean,
	url: string | null
}