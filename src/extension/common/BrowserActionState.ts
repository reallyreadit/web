import ContentScriptTab from './ContentScriptTab';
import UserArticle from '../../common/models/UserArticle';

export default interface BrowserActionState {
	activeTab?: ContentScriptTab,
	article?: UserArticle,
	isAuthenticated: boolean,
	isOnHomePage: boolean,
	showNewReplyIndicator: boolean,
	url: string
}