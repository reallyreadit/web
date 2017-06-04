import ContentScriptTab from './ContentScriptTab';
import UserArticle from './UserArticle';

interface ExtensionState {
	isAuthenticated: boolean,
	isOnHomePage: boolean,
	showNewReplyIndicator: boolean,
	focusedTab: ContentScriptTab,
	userArticle: UserArticle
}
export default ExtensionState;