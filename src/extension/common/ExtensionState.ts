import ContentScriptTab from './ContentScriptTab';
import UserArticle from '../../common/models/UserArticle';

interface ExtensionState {
	isAuthenticated: boolean,
	isOnHomePage: boolean,
	showNewReplyIndicator: boolean,
	focusedTab: ContentScriptTab,
	userArticle: UserArticle
}
export default ExtensionState;